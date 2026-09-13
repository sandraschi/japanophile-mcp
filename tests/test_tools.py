"""Seed-only tests: kanji lookup/search, JLPT next/answer/progress, knowledge list/get.

Big-DB tools (vocab over kanji.db) are tested for graceful degradation only -
kanji.db is never vendored, so CI asserts the friendly missing message.
"""

from fastapi.testclient import TestClient

from japanophile_mcp import server
from japanophile_mcp.http import build_app

client = TestClient(build_app())


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


def test_knowledge_html_route():
    res = client.get("/api/knowledge/html/20thcentury")
    assert res.status_code == 200
    assert "text/html" in res.headers.get("content-type", "")
    disp = res.headers.get("content-disposition", "")
    assert "attachment" not in disp.lower()
    assert "japanophile-know-embed" in res.text
    assert "../../styles.css" not in res.text
    assert "20th Century" in res.text or "20th century" in res.text.lower()
    anime = client.get("/api/knowledge/html/anime")
    assert anime.status_code == 200
    assert "Anime Industry" in anime.text
    assert ".store-text" in anime.text
    assert "../../styles.css" not in anime.text
    bad = client.get("/api/knowledge/html/no-such-page-xyz")
    assert bad.status_code == 404


def test_knowledge_list_get():
    lst = _call(server.knowledge, "list")
    assert lst["success"], lst
    assert "manga" in lst["data"]
    assert "anime" in lst["data"]
    assert "japanese-knowledge-tree" not in lst["data"]
    assert "kanji-table" not in lst["data"]
    got = _call(server.knowledge, "get", page="manga")
    assert got["success"], got
    assert len(got["data"]) > 100
    assert ".back-button" not in got["data"]
    got20 = _call(server.knowledge, "get", page="20thcentury")
    assert got20["success"], got20
    assert "20th Century" in got20["data"] or "20th century" in got20["data"].lower()
    assert "position: fixed" not in got20["data"]


def test_vocab_degrades_gracefully():
    res = _call(server.vocab, "search", query="\u6c34")
    # Either the big DB was fetched (success) or the friendly missing message.
    if not res["success"]:
        assert "data/kanji.db" in res["message"] or "kanji.db" in res["message"]


def _call(tool, *args, **kwargs):
    fn = getattr(tool, "fn", tool)
    return fn(*args, **kwargs)


def test_compat_kanji_search_shape():
    r = client.get("/api/kanji/search", params={"jlpt": "N5", "limit": 5})
    assert r.status_code == 200
    body = r.json()
    assert body["success"], body
    assert len(body["kanji"]) >= 1
    first = body["kanji"][0]
    assert isinstance(first["meanings"], list)


def test_compat_kanji_all_shape():
    r = client.get("/api/kanji/all", params={"limit": 10})
    body = r.json()
    assert body["success"] and len(body["kanji"]) == 10


def test_compat_jlpt_questions_shape():
    r = client.get("/api/jlpt/questions", params={"level": "N5", "limit": 3})
    body = r.json()
    assert body["success"], body
    assert len(body["questions"]) >= 1
    q = body["questions"][0]
    assert set(q) >= {"id", "question", "options", "correct", "explanations", "type", "level"}


def test_compat_submit_answers_roundtrip():
    r = client.post("/api/jlpt/submit-answers", json={"session_id": "pytest-compat", "answers": []})
    assert r.json()["success"]


def test_compat_bigdb_endpoints_degrade():
    for path in [
        "/api/vocab/jlpt?level=N5",
        "/api/vocabulary?jlpt=N5",
        "/api/examples/search?word=x",
        "/api/kanji/compounds?kanji=x",
    ]:
        body = client.get(path).json()
        # Fetched big DB -> success; otherwise friendly failure (both declared).
        assert "success" in body, path
