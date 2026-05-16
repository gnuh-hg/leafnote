"""Tách sft_full.jsonl → train.jsonl + test.jsonl, stratified theo document_type.

Đọc `_meta.document_type` từ mỗi dòng để bucket → shuffle deterministic →
90/10 split mỗi bucket → concat lại. Strip `_meta` khi ghi ra file cuối,
chỉ giữ `{"messages": [...]}` mà SFTTrainer cần.

Usage (từ backend/):
    python -m scripts.split_dataset
    python -m scripts.split_dataset --ratio 0.9 --seed 42
    python -m scripts.split_dataset --input data/sft_full.jsonl \\
        --train data/train.jsonl --test data/test.jsonl
"""
from __future__ import annotations

import argparse
import json
import random
import sys
from collections import defaultdict
from pathlib import Path


GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"


def _strip_meta(row: dict) -> dict:
    return {"messages": row["messages"]}


def split(input_path: Path, train_path: Path, test_path: Path, ratio: float, seed: int) -> int:
    if not input_path.exists():
        print(f"{RED}Input not found: {input_path}{RESET}", file=sys.stderr)
        return 1
    if not 0.5 <= ratio < 1.0:
        print(f"{RED}--ratio must be in [0.5, 1.0): got {ratio}{RESET}", file=sys.stderr)
        return 1

    buckets: dict[str, list[dict]] = defaultdict(list)
    with input_path.open(encoding="utf-8") as fin:
        for lineno, line in enumerate(fin, 1):
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as exc:
                print(f"{RED}line {lineno}: invalid JSON ({exc}){RESET}", file=sys.stderr)
                continue
            doc_type = (row.get("_meta") or {}).get("document_type", "unknown")
            buckets[doc_type].append(row)

    if not buckets:
        print(f"{RED}No rows found in {input_path}{RESET}", file=sys.stderr)
        return 1

    rng = random.Random(seed)
    train_rows: list[dict] = []
    test_rows: list[dict] = []
    stats: dict[str, dict[str, int]] = {}

    for doc_type, rows in sorted(buckets.items()):
        rng.shuffle(rows)
        n = len(rows)
        n_train = int(n * ratio)
        # Đảm bảo mỗi bucket có ít nhất 1 ở test khi n >= 2.
        if n >= 2 and n_train == n:
            n_train = n - 1
        train_rows.extend(rows[:n_train])
        test_rows.extend(rows[n_train:])
        stats[doc_type] = {"total": n, "train": n_train, "test": n - n_train}

    # Shuffle final order để không cluster theo doc_type.
    rng.shuffle(train_rows)
    rng.shuffle(test_rows)

    train_path.parent.mkdir(parents=True, exist_ok=True)
    test_path.parent.mkdir(parents=True, exist_ok=True)

    with train_path.open("w", encoding="utf-8") as f:
        for row in train_rows:
            f.write(json.dumps(_strip_meta(row), ensure_ascii=False) + "\n")
    with test_path.open("w", encoding="utf-8") as f:
        for row in test_rows:
            f.write(json.dumps(_strip_meta(row), ensure_ascii=False) + "\n")

    total = len(train_rows) + len(test_rows)
    print(f"\n{YELLOW}Split summary (ratio={ratio}, seed={seed}):{RESET}")
    print(f"  input:  {input_path}")
    print(f"  train:  {train_path}  ({GREEN}{len(train_rows)}{RESET})")
    print(f"  test:   {test_path}  ({GREEN}{len(test_rows)}{RESET})")
    print(f"  total:  {total}\n")
    print(f"  {'doc_type':<12} {'total':>6} {'train':>6} {'test':>6}")
    for dt, s in stats.items():
        print(f"  {dt:<12} {s['total']:>6} {s['train']:>6} {s['test']:>6}")

    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="data/sft_full.jsonl", type=Path)
    parser.add_argument("--train", default="data/train.jsonl", type=Path)
    parser.add_argument("--test", default="data/test.jsonl", type=Path)
    parser.add_argument("--ratio", type=float, default=0.9)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    return split(args.input, args.train, args.test, args.ratio, args.seed)


if __name__ == "__main__":
    sys.exit(main())
