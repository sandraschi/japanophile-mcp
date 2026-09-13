"""Seed-only tests: kanji lookup/search, JLPT next/answer/progress, knowledge list/get.

Big-DB tools (vocab over kanji.db) are tested for graceful degradation only -
kanji.db is never vendored, so CI asserts the friendly missing message.
"""

from japanophile_mcp import server


def test_kanji_lookup():
    res = (
        server.kanji.fn("lookup", query="\u6c34")
        if hasattr(server.kanji, "fn")
        else server.kanji("lookup", query="\u6c34")
    )
    assert res["success"], res
    assert res["data"][0]["kanji"] == "\u6c34"


def test_kanji_search():
    res = _call(server.kanji, "search", query="water")
    assert res["success"], res
    assert len(res["data"]) >= 1


def test_kanji_by_jlpt():
    res = _call(server.kanji, "by_jlpt", level="N5")
    assert res["success"], res
    assert len(res["data"]) >= 1


def test_kanji_bad_operation():
    res = _call(server.kanji, "nope")
    assert not res["success"]


def test_jlpt_next_answer_progress():
    nxt = _call(server.jlpt, "next", level="N5")
    assert nxt["success"], nxt
    qid = nxt["data"]["id"]
    assert len(nxt["data"]["options"]) >= 2
    ans = _call(server.jlpt, "answer", question_id=qid, answer="Z", session_id="pytest")
    assert ans["success"], ans
    prog = _call(server.jlpt, "progress", session_id="pytest")
    assert prog["success"] and prog["data"]["answered"] >= 1


def test_knowledge_list_get():
    lst = _call(server.knowledge, "list")
    assert lst["success"], lst
    assert "manga" in lst["data"]
    got = _call(server.knowledge, "get", page="manga")
    assert got["success"], got
    assert len(got["data"]) > 100


def test_vocab_degrades_gracefully():
    res = _call(server.vocab, "search", query="\u6c34")
    # Either the big DB was fetched (success) or the friendly missing message.
    if not res["success"]:
        assert "fetch_data" in res["message"]


def _call(tool, *args, **kwargs):
    fn = getattr(tool, "fn", tool)
    return fn(*args, **kwargs)
