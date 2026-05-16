"""Chấm điểm chất lượng leaves trả về từ engine.

Dùng heuristic thuần Python — không depend semantic embedding (giữ nhẹ runtime).
Khi có nhu cầu cao hơn, có thể swap sang sentence-transformers.
"""
from __future__ import annotations

import re
from typing import Iterable

from app.schemas.leaf import LEAF_TYPES, LeafEngineItem, QualityReport


_WORD_RE = re.compile(r"[\w']+", re.UNICODE)
ATOMICITY_MAX_WORDS = 80
GRANULARITY_MIN_WORDS = 15

# Threshold mặc định để pass quality gate. Có thể override qua env LEAF_QUALITY_MIN_SCORE.
DEFAULT_MIN_SCORE = 0.75

# Trọng số giống leaf-engine-training.md mục 2 nhưng có thêm granularity_floor.
WEIGHTS = {
    "coverage": 0.35,
    "atomicity": 0.20,
    "no_duplicate": 0.15,
    "type_valid": 0.15,
    "granularity_floor": 0.15,
}


def _tokens(text: str) -> set[str]:
    return {m.group(0).lower() for m in _WORD_RE.finditer(text)}


def _jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def _coverage(note: str, leaves: Iterable[LeafEngineItem]) -> float:
    note_tokens = _tokens(note)
    if not note_tokens:
        return 1.0
    combined = set()
    for leaf in leaves:
        combined |= _tokens(leaf.content)
    return min(1.0, len(note_tokens & combined) / len(note_tokens))


def _atomicity(leaves: list[LeafEngineItem]) -> float:
    if not leaves:
        return 1.0
    over = sum(1 for l in leaves if len(l.content.split()) > ATOMICITY_MAX_WORDS)
    return 1.0 - (over / len(leaves))


def _no_duplicate(leaves: list[LeafEngineItem]) -> float:
    if len(leaves) <= 1:
        return 1.0
    token_sets = [_tokens(l.content) for l in leaves]
    max_sim = 0.0
    for i in range(len(leaves)):
        for j in range(i + 1, len(leaves)):
            max_sim = max(max_sim, _jaccard(token_sets[i], token_sets[j]))
    return 1.0 - max_sim


def _type_valid(leaves: list[LeafEngineItem]) -> float:
    if not leaves:
        return 1.0
    valid = sum(1 for l in leaves if l.type in LEAF_TYPES)
    return valid / len(leaves)


def _granularity_floor(leaves: list[LeafEngineItem]) -> float:
    if not leaves:
        return 1.0
    too_short = 0
    for l in leaves:
        # Definition có term ngắn được miễn rule sàn.
        if l.type == "definition" and l.metadata.get("term"):
            continue
        if len(l.content.split()) < GRANULARITY_MIN_WORDS:
            too_short += 1
    return 1.0 - (too_short / len(leaves))


def score(note: str, leaves: list[LeafEngineItem]) -> QualityReport:
    if not leaves:
        # Empty leaf list không tự động fail — caller quyết định (freeform → empty là đúng).
        return QualityReport(
            coverage=0.0,
            atomicity=1.0,
            no_duplicate=1.0,
            type_valid=1.0,
            granularity_floor=1.0,
            total=0.0,
            issues=["empty_leaves"],
        )

    scores = {
        "coverage": _coverage(note, leaves),
        "atomicity": _atomicity(leaves),
        "no_duplicate": _no_duplicate(leaves),
        "type_valid": _type_valid(leaves),
        "granularity_floor": _granularity_floor(leaves),
    }
    total = sum(scores[k] * WEIGHTS[k] for k in WEIGHTS)

    issues = []
    if scores["coverage"] < 0.6:
        issues.append("low_coverage")
    if scores["atomicity"] < 0.8:
        issues.append("oversized_leaves")
    if scores["no_duplicate"] < 0.7:
        issues.append("duplicate_leaves")
    if scores["type_valid"] < 1.0:
        issues.append("invalid_types")
    if scores["granularity_floor"] < 0.8:
        issues.append("undersized_leaves")

    return QualityReport(**scores, total=total, issues=issues)


def passes(report: QualityReport, min_score: float = DEFAULT_MIN_SCORE) -> bool:
    return report.total >= min_score


def retry_hint(report: QualityReport) -> str:
    """Tạo hint để feed lại vào engine khi score thấp."""
    parts = []
    if "low_coverage" in report.issues:
        parts.append("đảm bảo cover hết các ý chính trong note, không bỏ sót")
    if "oversized_leaves" in report.issues:
        parts.append(f"tách nhỏ leaf vượt {ATOMICITY_MAX_WORDS} từ thành nhiều leaf riêng")
    if "duplicate_leaves" in report.issues:
        parts.append("không tạo leaf trùng nội dung dù khác cách diễn đạt")
    if "undersized_leaves" in report.issues:
        parts.append(f"không tạo leaf dưới {GRANULARITY_MIN_WORDS} từ trừ definition có term ngắn")
    return ". ".join(parts) if parts else "đảm bảo chất lượng cao hơn"
