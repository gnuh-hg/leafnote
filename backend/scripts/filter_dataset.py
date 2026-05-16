"""Lọc raw_leaves.jsonl theo quality gate của backend.

Giữ dòng khi:
- Mọi leaf trong `expected_leaves` pass Pydantic schema (`LeafEngineItem`).
- `leaf_quality.score(note, leaves).total >= threshold`.

Threshold mặc định lấy từ `settings.LEAF_QUALITY_MIN_SCORE` (0.75).

Usage (từ backend/):
    python -m scripts.filter_dataset
    python -m scripts.filter_dataset --input data/raw_leaves.jsonl --output data/leaves_clean.jsonl
    python -m scripts.filter_dataset --threshold 0.8 --report data/filter_report.json
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path

from pydantic import ValidationError

from app.core.config import settings
from app.schemas.leaf import LeafEngineItem
from app.services import leaf_quality


GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"


def _try_parse_leaves(raw: list[dict]) -> tuple[list[LeafEngineItem] | None, str | None]:
    try:
        return [LeafEngineItem(**item) for item in raw], None
    except ValidationError as exc:
        return None, str(exc).splitlines()[0][:200]


def filter_file(input_path: Path, output_path: Path, threshold: float, report_path: Path | None) -> int:
    if not input_path.exists():
        print(f"{RED}Input not found: {input_path}{RESET}", file=sys.stderr)
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)

    stats: dict[str, dict[str, int]] = defaultdict(lambda: {"total": 0, "kept": 0, "dropped_schema": 0, "dropped_score": 0, "dropped_empty": 0})
    dropped_examples: list[dict] = []
    kept = 0
    dropped = 0

    with input_path.open(encoding="utf-8") as fin, output_path.open("w", encoding="utf-8") as fout:
        for lineno, line in enumerate(fin, 1):
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as exc:
                print(f"{RED}line {lineno}: invalid JSON ({exc}){RESET}")
                dropped += 1
                continue

            doc_type = row.get("document_type", "unknown")
            note = row.get("note", "")
            raw_leaves = row.get("expected_leaves", [])
            stats[doc_type]["total"] += 1

            # Freeform có thể có expected_leaves rỗng — bỏ qua khỏi training set,
            # engine không chạy với freeform.
            if doc_type == "freeform":
                dropped += 1
                stats[doc_type]["dropped_empty"] += 1
                continue

            if not raw_leaves:
                dropped += 1
                stats[doc_type]["dropped_empty"] += 1
                dropped_examples.append({"id": row.get("id"), "reason": "empty_leaves"})
                continue

            leaves, schema_err = _try_parse_leaves(raw_leaves)
            if leaves is None:
                dropped += 1
                stats[doc_type]["dropped_schema"] += 1
                dropped_examples.append({"id": row.get("id"), "reason": f"schema: {schema_err}"})
                continue

            report = leaf_quality.score(note, leaves)
            if report.total < threshold:
                dropped += 1
                stats[doc_type]["dropped_score"] += 1
                dropped_examples.append({
                    "id": row.get("id"),
                    "reason": "low_score",
                    "total": round(report.total, 3),
                    "issues": report.issues,
                })
                continue

            fout.write(json.dumps(row, ensure_ascii=False) + "\n")
            kept += 1
            stats[doc_type]["kept"] += 1

    total = kept + dropped
    rate = (kept / total) if total else 0.0
    print(f"\n{YELLOW}Filter summary (threshold={threshold}):{RESET}")
    print(f"  input:   {input_path}")
    print(f"  output:  {output_path}")
    print(f"  kept:    {GREEN}{kept}{RESET} / {total}  ({rate:.0%})")
    print(f"  dropped: {RED}{dropped}{RESET}\n")

    print(f"  {'doc_type':<12} {'total':>6} {'kept':>6} {'schema':>7} {'score':>6} {'empty':>6}")
    for dt, s in sorted(stats.items()):
        print(f"  {dt:<12} {s['total']:>6} {s['kept']:>6} {s['dropped_schema']:>7} {s['dropped_score']:>6} {s['dropped_empty']:>6}")

    if report_path:
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(
            json.dumps({
                "threshold": threshold,
                "kept": kept,
                "dropped": dropped,
                "rate": rate,
                "by_doc_type": dict(stats),
                "dropped_examples": dropped_examples[:200],
            }, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"\n  report:  {report_path}")

    return 0 if kept > 0 else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="data/raw_leaves.jsonl", type=Path)
    parser.add_argument("--output", default="data/leaves_clean.jsonl", type=Path)
    parser.add_argument("--threshold", type=float, default=settings.LEAF_QUALITY_MIN_SCORE)
    parser.add_argument("--report", type=Path, default=None,
                        help="ghi JSON báo cáo (kèm 200 dropped example đầu)")
    args = parser.parse_args()

    return filter_file(args.input, args.output, args.threshold, args.report)


if __name__ == "__main__":
    sys.exit(main())
