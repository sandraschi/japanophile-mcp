"""HTTP bridge: FastAPI REST + static Learn/Know assets + MCP streamable HTTP.

Stdio (Claude Desktop etc.) stays in server.py. Browsers and the Tauri
frontend talk here on 11193. Same impl functions, same dialogic returns.
"""

from __future__ import annotations

import argparse

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from . import server
from .db import REPO_ROOT


def build_app() -> FastAPI:
    app = FastAPI(title="japanophile-mcp", version="0.2.0")
    # Webapp origin (11194), Tauri, LAN dev: same open-CORS posture as fleet.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Compat shim FIRST: specific old-shape paths must beat /{operation} below.
    from .compat import mount_compat

    mount_compat(app)

    @app.get("/health")
    def health() -> dict:
        return {"ok": True, "repo": "japanophile-mcp", "stage": 2}

    @app.get("/api/help")
    def api_help() -> JSONResponse:
        return JSONResponse(_call(server.japanophile_help))

    @app.get("/api/kanji/{operation}")
    def api_kanji(
        operation: str,
        query: str = "",
        level: str = "",
        grade: int = 0,
        radical: str = "",
        limit: int = 20,
    ) -> JSONResponse:
        return JSONResponse(
            _call(
                server.kanji,
                operation,
                query=query,
                level=level,
                grade=grade,
                radical=radical,
                limit=limit,
            )
        )

    @app.get("/api/jlpt/next")
    def api_jlpt_next(level: str = "N5") -> JSONResponse:
        return JSONResponse(_call(server.jlpt, "next", level=level))

    @app.post("/api/jlpt/answer")
    def api_jlpt_answer(payload: dict) -> JSONResponse:
        return JSONResponse(
            _call(
                server.jlpt,
                "answer",
                question_id=int(payload.get("question_id", 0)),
                answer=str(payload.get("answer", "")),
                session_id=str(payload.get("session_id", "default")),
                response_time_ms=int(payload.get("response_time_ms", 0)),
            )
        )

    @app.get("/api/jlpt/progress")
    def api_jlpt_progress(session_id: str = "default") -> JSONResponse:
        return JSONResponse(_call(server.jlpt, "progress", session_id=session_id))

    @app.get("/api/vocab/{operation}")
    def api_vocab(
        operation: str, query: str = "", level: str = "", limit: int = 20
    ) -> JSONResponse:
        return JSONResponse(_call(server.vocab, operation, query=query, level=level, limit=limit))

    @app.get("/api/knowledge")
    def api_knowledge_list() -> JSONResponse:
        return JSONResponse(_call(server.knowledge, "list"))

    @app.get("/api/knowledge/{page}")
    def api_knowledge_get(page: str) -> JSONResponse:
        return JSONResponse(_call(server.knowledge, "get", page=page))

    games = REPO_ROOT / "assets" / "games" / "japanese-language"
    if games.is_dir():
        app.mount("/games", StaticFiles(directory=str(games), html=True), name="games")
    know = REPO_ROOT / "assets" / "knowledge" / "japan"
    if know.is_dir():
        app.mount("/know", StaticFiles(directory=str(know), html=True), name="know")
    skills = REPO_ROOT / "skills"
    if skills.is_dir():
        app.mount("/skills", StaticFiles(directory=str(skills), html=False), name="skills")

    import logging

    try:
        app.mount("/mcp", server.mcp.http_app())
    except (AttributeError, RuntimeError) as exc:  # no http_app in this FastMCP: REST serves
        logging.getLogger("japanophile_mcp").warning("/mcp mount skipped: %s", exc)
    return app


def _call(tool, *args, **kwargs) -> dict:
    fn = getattr(tool, "fn", tool)
    res = fn(*args, **kwargs)
    return res if isinstance(res, dict) else {"success": True, "data": res}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=11193)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()
    uvicorn.run(build_app(), host=args.host, port=args.port)


if __name__ == "__main__":
    main()
