"""Validate raw_leaves.jsonl trước khi append vào training set.

Khác filter_dataset.py: KHÔNG ghi file output, chỉ in báo cáo. Dùng sau mỗi
session sinh data để bắt sớm lỗi format trước khi append nhiều dòng.

Check 2 lớp:
1. Hard fail (schema sai → exit 1):
   - Mỗi leaf chỉ có đúng 4 keys {type, content, metadata, confidence}.
   - Pydantic LeafEngineItem pass (type hợp lệ, content 1..2000 chars, confidence 0..1).
   - Metadata khớp matrix (type, document_type):
     * definition  → có term + meaning
     * fact (theory/narrative/reference) → KHÔNG có ordinal
     * fact (procedure) → có ordinal
     * example → có polarity ∈ {positive, negative}
   - expected_leaves không rỗng (trừ freeform).

2. Soft warn (in cảnh báo, không exit 1):
   - leaf_quality.score(note, leaves).total < threshold (mặc định 0.75).
   - Confidence tất cả bằng 1.0 trong cùng example.

Usage (từ backend/):
    python -m scripts.validate_session
    python -m scripts.validate_session --input data/raw_leaves.jsonl
    python -m scripts.validate_session --last 50
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Windows console mặc định cp1252 — ép UTF-8 để in được tiếng Việt.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from pydantic import ValidationError

from app.schemas.leaf import LeafEngineItem
from app.services import leaf_quality


GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

ALLOWED_LEAF_KEYS = frozenset({"type", "content", "metadata", "confidence"})
WARN_THRESHOLD = 0.75


def _check_metadata(leaf: dict, doc_type: str) -> str | None:
    t = leaf.get("type")
    meta = leaf.get("metadata") or {}
    if not isinstance(meta, dict):
        return "metadata không phải dict"

    if t == "definition":
        if not meta.get("term") or not meta.get("meaning"):
            return "definition thiếu metadata.term hoặc metadata.meaning"
    elif t == "example":
        if meta.get("polarity") not in {"positive", "negative"}:
            return "example thiếu metadata.polarity ∈ {positive, negative}"
    elif t == "fact":
        # ordinal là optional cho procedure (contract:66) — không hard-fail nếu thiếu,
        # nhưng các doc type khác KHÔNG được có ordinal (rõ ràng wrong doc_type).
        if doc_type in {"theory", "narrative", "reference"} and "ordinal" in meta:
            return f"fact trong {doc_type} KHÔNG được có metadata.ordinal"
    return None


def _soft_metadata_hint(leaf: dict, doc_type: str) -> str | None:
    t = leaf.get("type")
    meta = leaf.get("metadata") or {}
    if t == "fact" and doc_type == "procedure" and "ordinal" not in meta:
        return "fact trong procedure nên có metadata.ordinal (trừ leaf intro/outro)"
    return None


def _check_extra_keys(leaf: dict) -> str | None:
    extras = set(leaf.keys()) - ALLOWED_LEAF_KEYS
    if extras:
        return f"leaf có key thừa: {sorted(extras)}"
    return None


def validate(input_path: Path, last: int | None) -> int:
    if not input_path.exists():
        print(f"{RED}Input not found: {input_path}{RESET}", file=sys.stderr)
        return 1

    lines = input_path.read_text(encoding="utf-8").splitlines()
    lines = [l for l in lines if l.strip()]
    if last:
        lines = lines[-last:]
        print(f"{YELLOW}Validating LAST {len(lines)} lines của {input_path}{RESET}")
    else:
        print(f"{YELLOW}Validating ALL {len(lines)} lines của {input_path}{RESET}")

    hard_errors: list[str] = []
    soft_warnings: list[str] = []
    scores: list[float] = []
    pass_threshold = 0

    for idx, line in enumerate(lines, 1):
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            hard_errors.append(f"line {idx}: JSON invalid ({exc})")
            continue

        rid = row.get("id", f"<line {idx}>")
        doc_type = row.get("document_type", "unknown")
        note = row.get("note", "")
        raw_leaves = row.get("expected_leaves", [])

        if doc_type == "freeform":
            continue

        if not isinstance(raw_leaves, list) or not raw_leaves:
            hard_errors.append(f"{rid}: expected_leaves rỗng hoặc sai type")
            continue

        # Per-leaf checks
        for li, leaf in enumerate(raw_leaves):
            if not isinstance(leaf, dict):
                hard_errors.append(f"{rid}/leaf{li}: không phải object")
                continue
            err = _check_extra_keys(leaf)
            if err:
                hard_errors.append(f"{rid}/leaf{li}: {err}")
            err = _check_metadata(leaf, doc_type)
            if err:
                hard_errors.append(f"{rid}/leaf{li}: {err}")
            hint = _soft_metadata_hint(leaf, doc_type)
            if hint:
                soft_warnings.append(f"{rid}/leaf{li}: {hint}")

        # Pydantic validate
        try:
            leaves = [LeafEngineItem(**l) for l in raw_leaves]
        except ValidationError as exc:
            hard_errors.append(f"{rid}: schema fail — {str(exc).splitlines()[0][:200]}")
            continue

        # Soft warnings
        confidences = {l.confidence for l in leaves}
        if confidences == {1.0}:
            soft_warnings.append(f"{rid}: tất cả confidence = 1.0 (không thực tế)")

        report = leaf_quality.score(note, leaves)
        scores.append(report.total)
        if report.total >= WARN_THRESHOLD:
            pass_threshold += 1
        else:
            soft_warnings.append(
                f"{rid}: quality score {report.total:.2f} < {WARN_THRESHOLD} "
                f"({', '.join(report.issues) or 'no specific issue'})"
            )

    total = len(lines)
    pass_rate = (pass_threshold / total) if total else 0.0
    avg_score = (sum(scores) / len(scores)) if scores else 0.0

    print()
    print(f"  {'Hard errors':<20} {len(hard_errors):>4}")
    print(f"  {'Soft warnings':<20} {len(soft_warnings):>4}")
    print(f"  {'Score ≥ 0.75':<20} {pass_threshold:>4} / {total}  ({pass_rate:.0%})")
    print(f"  {'Avg quality score':<20} {avg_score:>6.3f}")
    print()

    if hard_errors:
        print(f"{RED}=== HARD ERRORS (sửa trước khi train) ==={RESET}")
        for e in hard_errors[:40]:
            print(f"  {e}")
        if len(hard_errors) > 40:
            print(f"  ... và {len(hard_errors) - 40} lỗi khác")
        print()

    if soft_warnings:
        print(f"{YELLOW}=== SOFT WARNINGS (sẽ tăng tỷ lệ filter reject) ==={RESET}")
        for w in soft_warnings[:30]:
            print(f"  {w}")
        if len(soft_warnings) > 30:
            print(f"  ... và {len(soft_warnings) - 30} cảnh báo khác")
        print()

    if not hard_errors:
        print(f"{GREEN}✓ Schema OK — không có hard error{RESET}")

    return 1 if hard_errors else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="data/raw_leaves.jsonl", type=Path)
    parser.add_argument("--last", type=int, default=None,
                        help="chỉ validate N dòng cuối (thường = 50 sau mỗi session)")
    args = parser.parse_args()
    return validate(args.input, args.last)


if __name__ == "__main__":
    sys.exit(main())
