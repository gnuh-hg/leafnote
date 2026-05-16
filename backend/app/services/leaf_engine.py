"""Gateway gọi LLM endpoint để tách note thành leaves.

Backend không hard-code provider. Cần 3 env:
    LEAF_ENGINE_URL    — OpenAI-compatible chat completions endpoint
    LEAF_ENGINE_API_KEY
    LEAF_ENGINE_MODEL

Endpoint phải accept payload OpenAI chat schema và trả response cùng schema.
Together AI, Claude (qua proxy), self-host vLLM, n8n webhook đều OK.
"""
from __future__ import annotations

import json
import logging
from typing import Any

import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.leaf import LeafEngineItem


logger = logging.getLogger(__name__)


class LeafEngineError(RuntimeError):
    """Raised khi engine fail (timeout, 5xx, parse error, schema error)."""


_BASE_PROMPT = """Bạn là Leaf Engine — hệ thống phân tách ghi chú thành các "leaf" (đơn vị kiến thức nguyên tử) cho ứng dụng Leafnote.

QUY TẮC CHUNG (luôn áp dụng):
- Mỗi leaf = 1 ý duy nhất, đứng độc lập, người đọc hiểu được mà không cần ngữ cảnh leaf khác.
- Giữ nguyên ngôn ngữ gốc (Việt/Anh/mix).
- Không ghép 2 ý vào 1 leaf. Không bỏ sót ý quan trọng.
- Không leaf nào dài quá 80 từ. Không leaf nào ngắn dưới 15 từ (trừ definition có term ngắn).
- Type của leaf chỉ thuộc enum đóng: definition | fact | example | question | note.
- Không tự sinh type mới. Nếu phân loại không tự tin → dùng "note".

METADATA mỗi leaf:
- definition: phải có {term, meaning}
- fact: tùy chọn {ordinal} (cho procedure), {source} (cho meeting/quote), {format: text|math|code}, {polarity: positive|negative}
- example: phải có {polarity: positive|negative}, tùy chọn {parent_leaf_id}
- question: không bắt buộc metadata
- note: không bắt buộc metadata

CONFIDENCE:
- 0.9–1.0 cho leaf rõ ràng, có chứng cứ trực tiếp trong note.
- 0.7–0.9 cho leaf cần suy luận nhẹ.
- < 0.7 cho leaf mơ hồ hoặc chỉ nhắc lướt.

OUTPUT:
- JSON array thuần, không markdown fence, không giải thích.
- Mỗi leaf: {"type": "...", "content": "...", "metadata": {...}, "confidence": 0.0..1.0}
"""


_DOC_TYPE_HINT: dict[str, str] = {
    "theory": (
        "DOCUMENT_TYPE = theory. Tập trung tách `definition` (thuật ngữ + nghĩa) và `fact` "
        "(luận điểm, công thức, quy tắc). Bỏ qua câu nối thuần ngữ pháp."
    ),
    "narrative": (
        "DOCUMENT_TYPE = narrative. Tách `fact` cho sự kiện/quan sát có thông tin cụ thể, "
        "`question` cho câu hỏi mở. Bỏ qua câu cảm thán không có thông tin."
    ),
    "procedure": (
        "DOCUMENT_TYPE = procedure. Mỗi bước = 1 `fact` với metadata.ordinal là số thứ tự gốc. "
        "Giữ đúng thứ tự. Nguyên liệu/yêu cầu chung tách thành `fact` riêng (không có ordinal)."
    ),
    "reference": (
        "DOCUMENT_TYPE = reference. Chủ yếu `definition` (mỗi mục cheatsheet = 1 definition) "
        "và `fact`. Format code/math giữ nguyên trong content + metadata.format."
    ),
    "meeting": (
        "DOCUMENT_TYPE = meeting. `fact` cho quyết định/action item/báo cáo, kèm "
        "metadata.source là tên cuộc họp. `question` cho câu hỏi chưa giải. Bỏ qua "
        "danh sách tham dự thuần."
    ),
    "freeform": "",  # không dùng — short-circuit ở orchestrator
}


def _build_system_prompt(document_type: str) -> str:
    hint = _DOC_TYPE_HINT.get(document_type, "")
    return f"{_BASE_PROMPT}\n\n{hint}".strip()


def _build_payload(note_text: str, document_type: str) -> dict[str, Any]:
    return {
        "model": settings.LEAF_ENGINE_MODEL,
        "temperature": 0.1,
        "max_tokens": 2000,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": _build_system_prompt(document_type)},
            {"role": "user", "content": f"## Note\n\n{note_text}"},
        ],
    }


def _extract_content(response_json: dict[str, Any]) -> str:
    try:
        return response_json["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise LeafEngineError(f"Engine response missing choices[0].message.content: {response_json!r}") from exc


def _parse_leaves(raw: str) -> list[LeafEngineItem]:
    """Parse JSON array string. Tolerant: cho phép {"leaves": [...]} hoặc array trực tiếp."""
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise LeafEngineError(f"Engine output not JSON: {raw[:200]!r}") from exc

    if isinstance(data, dict):
        for key in ("leaves", "items", "data", "result"):
            if key in data and isinstance(data[key], list):
                data = data[key]
                break
        else:
            raise LeafEngineError(f"Engine output dict but no leaves key: {list(data.keys())}")

    if not isinstance(data, list):
        raise LeafEngineError(f"Engine output not array: {type(data).__name__}")

    items: list[LeafEngineItem] = []
    for raw_item in data:
        try:
            items.append(LeafEngineItem.model_validate(raw_item))
        except ValidationError as exc:
            logger.warning("dropping invalid leaf: %s | item=%s", exc, raw_item)
    return items


async def split_note(note_text: str, document_type: str, *, retry_hint: str | None = None) -> list[LeafEngineItem]:
    """Gọi LLM endpoint, trả về danh sách leaf đã validate.

    `freeform` short-circuit return [] (không gọi engine).
    `retry_hint` nếu có sẽ append vào system prompt — dùng cho quality-gate retry.
    """
    if document_type == "freeform":
        return []

    note_text = note_text.strip()
    if not note_text:
        return []

    payload = _build_payload(note_text, document_type)
    if retry_hint:
        payload["messages"][0]["content"] += f"\n\nQUAN TRỌNG: {retry_hint}"

    headers = {
        "Authorization": f"Bearer {settings.LEAF_ENGINE_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=settings.LEAF_ENGINE_TIMEOUT_S) as client:
            response = await client.post(
                settings.LEAF_ENGINE_URL, json=payload, headers=headers
            )
    except httpx.TimeoutException as exc:
        raise LeafEngineError(f"Engine timeout after {settings.LEAF_ENGINE_TIMEOUT_S}s") from exc
    except httpx.HTTPError as exc:
        raise LeafEngineError(f"Engine HTTP error: {exc}") from exc

    if response.status_code >= 400:
        raise LeafEngineError(
            f"Engine returned {response.status_code}: {response.text[:300]}"
        )

    try:
        response_json = response.json()
    except ValueError as exc:
        raise LeafEngineError(f"Engine response not JSON: {response.text[:200]!r}") from exc

    content = _extract_content(response_json)
    return _parse_leaves(content)
