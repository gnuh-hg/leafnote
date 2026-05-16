"""Convert leaves_clean.jsonl → format messages cho Qwen SFT.

Mỗi dòng output có shape:
    {
      "messages": [
        {"role": "system",    "content": <_build_system_prompt(doc_type)>},
        {"role": "user",      "content": "## Note\n\n<note>"},
        {"role": "assistant", "content": "<json.dumps(expected_leaves)>"}
      ],
      "_meta": {"document_type": "<doc_type>", "id": "<id>"}
    }

`_meta` là field phụ trợ — `split_dataset.py` đọc để stratify rồi strip trước khi
ghi train/test cuối cùng. Qwen không bao giờ thấy field này.

System prompt được dựng bằng `_build_system_prompt` của production engine →
train/serve đồng nhất theo `information/leaf-engine-contract.md` mục 3 + 7.

Usage (từ backend/):
    python -m scripts.convert_to_sft
    python -m scripts.convert_to_sft --input data/leaves_clean.jsonl --output data/sft_full.jsonl
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

from app.services.leaf_engine import _build_system_prompt


GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

SKIPPED_DOC_TYPES = {"freeform"}


def convert(input_path: Path, output_path: Path) -> int:
    if not input_path.exists():
        print(f"{RED}Input not found: {input_path}{RESET}", file=sys.stderr)
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)

    written = 0
    skipped = 0
    by_type: Counter[str] = Counter()

    with input_path.open(encoding="utf-8") as fin, output_path.open("w", encoding="utf-8") as fout:
        for lineno, line in enumerate(fin, 1):
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as exc:
                print(f"{RED}line {lineno}: invalid JSON ({exc}){RESET}", file=sys.stderr)
                skipped += 1
                continue

            doc_type = row.get("document_type")
            note = row.get("note")
            leaves = row.get("expected_leaves")

            if not doc_type or note is None or leaves is None:
                print(f"{RED}line {lineno}: missing required field{RESET}", file=sys.stderr)
                skipped += 1
                continue

            if doc_type in SKIPPED_DOC_TYPES:
                skipped += 1
                continue

            example = {
                "messages": [
                    {"role": "system", "content": _build_system_prompt(doc_type)},
                    {"role": "user", "content": f"## Note\n\n{note}"},
                    {"role": "assistant", "content": json.dumps(leaves, ensure_ascii=False)},
                ],
                "_meta": {
                    "document_type": doc_type,
                    "id": row.get("id"),
                },
            }
            fout.write(json.dumps(example, ensure_ascii=False) + "\n")
            written += 1
            by_type[doc_type] += 1

    print(f"\n{YELLOW}Convert summary:{RESET}")
    print(f"  input:   {input_path}")
    print(f"  output:  {output_path}")
    print(f"  written: {GREEN}{written}{RESET}")
    print(f"  skipped: {skipped}\n")
    print(f"  {'doc_type':<12} {'count':>6}")
    for dt, count in sorted(by_type.items()):
        print(f"  {dt:<12} {count:>6}")

    return 0 if written > 0 else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="data/leaves_clean.jsonl", type=Path)
    parser.add_argument("--output", default="data/sft_full.jsonl", type=Path)
    args = parser.parse_args()

    return convert(args.input, args.output)


if __name__ == "__main__":
    sys.exit(main())
