"""Regression eval cho Leaf Engine.

Chạy LEAF_ENGINE_URL trên fixture set và in score table.
Dùng mỗi khi swap model hoặc đổi prompt — verify không regression.

Usage (từ backend/):
    python -m scripts.eval_engine
    python -m scripts.eval_engine --fixture tests/fixtures/seed_all_doctypes.jsonl
    python -m scripts.eval_engine --baseline   # ghi kết quả thành baseline
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path
from statistics import mean

from app.services import leaf_engine, leaf_quality


GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"


async def eval_one(example: dict) -> dict:
    note = example["note"]
    document_type = example["document_type"]
    try:
        leaves = await leaf_engine.split_note(note, document_type)
    except leaf_engine.LeafEngineError as exc:
        return {
            "id": example["id"],
            "ok": False,
            "error": str(exc)[:200],
            "scores": None,
        }
    report = leaf_quality.score(note, leaves)
    return {
        "id": example["id"],
        "document_type": document_type,
        "ok": leaf_quality.passes(report),
        "leaf_count": len(leaves),
        "expected_count": len(example.get("expected_leaves", [])),
        "scores": report.model_dump(),
    }


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fixture", default="tests/fixtures/seed_all_doctypes.jsonl")
    parser.add_argument("--baseline", action="store_true",
                        help="write results to eval_history.json as new baseline")
    args = parser.parse_args()

    path = Path(args.fixture)
    if not path.exists():
        print(f"{RED}Fixture not found: {path}{RESET}")
        return 1

    examples = [json.loads(l) for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]
    print(f"{YELLOW}Evaluating {len(examples)} examples against engine...{RESET}\n")

    results = []
    for ex in examples:
        # Skip freeform — engine không chạy.
        if ex["document_type"] == "freeform":
            results.append({
                "id": ex["id"], "ok": True, "scores": None,
                "leaf_count": 0, "expected_count": 0, "skipped": True,
            })
            continue
        result = await eval_one(ex)
        results.append(result)
        mark = f"{GREEN}PASS{RESET}" if result["ok"] else f"{RED}FAIL{RESET}"
        if result["scores"]:
            print(f"  [{mark}] {result['id']:<14} "
                  f"leaves={result['leaf_count']}/{result['expected_count']} "
                  f"score={result['scores']['total']:.2f}")
        else:
            print(f"  [{mark}] {result['id']:<14} ERROR: {result.get('error', '')}")

    valid = [r for r in results if r["scores"]]
    if valid:
        avg_total = mean(r["scores"]["total"] for r in valid)
        avg_coverage = mean(r["scores"]["coverage"] for r in valid)
        avg_atomicity = mean(r["scores"]["atomicity"] for r in valid)
        avg_no_dup = mean(r["scores"]["no_duplicate"] for r in valid)
        pass_rate = sum(1 for r in valid if r["ok"]) / len(valid)
        print(f"\n{YELLOW}Summary:{RESET}")
        print(f"  pass rate:    {pass_rate:.0%} ({sum(1 for r in valid if r['ok'])}/{len(valid)})")
        print(f"  avg total:    {avg_total:.3f}")
        print(f"  avg coverage: {avg_coverage:.3f}")
        print(f"  avg atomic:   {avg_atomicity:.3f}")
        print(f"  avg no_dup:   {avg_no_dup:.3f}")

        baseline_path = Path("eval_history.json")
        if args.baseline:
            baseline_path.write_text(
                json.dumps({"avg_total": avg_total, "pass_rate": pass_rate}, indent=2),
                encoding="utf-8",
            )
            print(f"\n{GREEN}Wrote baseline to {baseline_path}{RESET}")
        elif baseline_path.exists():
            baseline = json.loads(baseline_path.read_text())
            delta = avg_total - baseline["avg_total"]
            color = GREEN if delta >= -0.02 else RED
            print(f"\n  vs baseline:  {color}{delta:+.3f}{RESET} (baseline={baseline['avg_total']:.3f})")

    return 0 if all(r["ok"] for r in results) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
