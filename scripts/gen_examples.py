"""Generate mcpb/assets/prompts/examples.json from REAL tool runs (>=100 objects).

No invented outputs: every example calls the actual impl and records a
truncated summary. Run: uv run python scripts/gen_examples.py
"""
from __future__ import annotations

import json
from pathlib import Path

from japanophile_mcp import server

REPO = Path(__file__).resolve().parents[1]
OUT = REPO / "mcpb" / "assets" / "prompts" / "examples.json"


def call(tool, *args, **kwargs):
    fn = getattr(tool, "fn", tool)
    return fn(*args, **kwargs)


def ex(tool: str, operation: str, Fad: dict, res: dict, note: str = "") -> dict:
    summary = res.get("message", "")
    data = res.get("data")
    if isinstance(data, list):
        preview = data[:3]
    elif isinstance(data, dict):
        preview = {k: (v[:3] if isinstance(v, list) else v) for k, v in list(data.items())[:4]}
    else:
        preview = str(data)[:300] if data is not None else None
    return {"tool": tool, "operation": operation, "input": Fad,
            "success": bool(res.get("success")), "output_summary": summary,
            "output_preview": preview, "note": note}


def main() -> None:
    out: list[dict] = []

    chars = list("日本語水火木金土曜毎食飲見聞読書語電車国時年気大小高手長間本学行出入上下中今毎食")
    for ch in chars[:30]:
        r = call(server.kanji, "lookup", query=ch)
        out.append(ex("kanji", "lookup", {"query": ch}, r,
                      "Single-char dictionary detail."))

    for frag in ["water", "fire", "school", "time", "mountain", "heart", "moon",
                 "gold", "tree", "book", "study", "electric", "country", "big", "long"]:
        r = call(server.kanji, "search", query=frag, limit=3)
        out.append(ex("kanji", "search", {"query": frag, "limit": 3}, r,
                      "English-meaning fragment search."))

    for lvl in ["N5", "N4", "N3", "N2", "N1"]:
        r = call(server.kanji, "by_jlpt", level=lvl, limit=3)
        out.append(ex("kanji", "by_jlpt", {"level": lvl, "limit": 3}, r,
                      "Frequency-ordered level set for drills."))

    for grade in [1, 2, 3]:
        r = call(server.kanji, "by_grade", grade=grade, limit=3)
        out.append(ex("kanji", "by_grade", {"grade": grade, "limit": 3}, r,
                      "School-grade set."))

    for rad in ["水", "木", "日"]:
        r = call(server.kanji, "by_radical", radical=rad, limit=3)
        out.append(ex("kanji", "by_radical", {"radical": rad, "limit": 3}, r,
                      "Shared-radical family."))

    for i in range(5):
        r = call(server.kanji, "random", limit=2)
        out.append(ex("kanji", "random", {"limit": 2}, r,
                      "Drill draw #{}.".format(i + 1)))

    for lvl in ["N5", "N4", "N3", "N2", "N1"]:
        r = call(server.jlpt, "next", level=lvl)
        out.append(ex("jlpt", "next", {"level": lvl}, r,
                      "Quiz draw; answer key withheld, options included."))

    r = call(server.jlpt, "next", level="N5")
    qid = r["data"]["id"] if r.get("success") else 0
    r2 = call(server.jlpt, "answer", question_id=qid, answer="Z",
              session_id="examples-gen")
    out.append(ex("jlpt", "answer",
                  {"question_id": qid, "answer": "Z", "session_id": "examples-gen"},
                  r2, "Grading records to the progress store."))
    r3 = call(server.jlpt, "progress", session_id="examples-gen")
    out.append(ex("jlpt", "progress", {"session_id": "examples-gen"}, r3,
                  "Session score summary."))

    r = call(server.knowledge, "list")
    out.append(ex("knowledge", "list", {}, r, "Knowledge box index."))
    pages = r["data"] if r.get("success") else []
    for page in pages:
        r = call(server.knowledge, "get", page=page)
        preview = str(r.get("data", ""))[:200] if r.get("success") else None
        out.append({"tool": "knowledge", "operation": "get", "input": {"page": page},
                    "success": bool(r.get("success")),
                    "output_summary": r.get("message", ""),
                    "output_preview": preview,
                    "note": "Culture page, plain text."})

    r = call(server.vocab, "search", query="water")
    out.append(ex("vocab", "search", {"query": "water"}, r,
                  "Big-DB search or the friendly fetch hint when kanji.db is absent."))
    r = call(server.kanji, "nope")
    out.append(ex("kanji", "nope", {}, r, "Unknown operation returns guidance, not a traceback."))
    r = call(server.japanophile_help)
    out.append(ex("japanophile_help", "-", {}, r, "Agents call this first: tools plus data status."))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("wrote {} examples to {}".format(len(out), OUT))
    assert len(out) >= 100, "need >=100 examples, got {}".format(len(out))


if __name__ == "__main__":
    main()
