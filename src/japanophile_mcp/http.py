"""HTTP bridge: FastAPI REST + static Learn/Know assets + MCP streamable HTTP.

Stdio (Claude Desktop etc.) stays in server.py. Browsers and the Tauri
frontend talk here on 11193. Same impl functions, same dialogic returns.
"""

from __future__ import annotations

import argparse

import uvicorn
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from . import server
from .db import ASSET_ROOT, REPO_ROOT


def build_app() -> FastAPI:
    app = FastAPI(title="japanophile-mcp", version="0.3.1")
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

    from .tools_web import mount_tools_routes

    mount_tools_routes(app, server.mcp)

    api = APIRouter(prefix="/api")
    from .services.apps_routes import register_apps_routes
    from .services.llm_routes import register_llm_routes
    from .services.logs_routes import register_logs_routes
    from .services.prefs_routes import register_user_prefs_routes

    register_apps_routes(api)
    register_llm_routes(api)
    register_logs_routes(api)
    register_user_prefs_routes(api)
    app.include_router(api)

    from .activity_log import install_log_handler, log_activity, register_activity_middleware

    install_log_handler()
    register_activity_middleware(app)
    log_activity("system", "japanophile-mcp HTTP bridge ready", level="INFO")

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

    @app.get("/api/knowledge/html/{page}")
    def api_knowledge_html(page: str):
        target = server.resolve_knowledge_page(page)
        if target is None:
            raise HTTPException(status_code=404, detail="Not Found")
        body = server.knowledge_html_for_embed(target)
        return HTMLResponse(
            content=body,
            media_type="text/html; charset=utf-8",
            headers={"Content-Disposition": "inline"},
        )

    @app.get("/api/knowledge/{page}")
    def api_knowledge_get(page: str) -> JSONResponse:
        return JSONResponse(_call(server.knowledge, "get", page=page))

    from . import language_pages

    @app.get("/api/language")
    def api_language_list() -> JSONResponse:
        tabs = [{"id": tid, "label": lbl} for tid, lbl in language_pages.LANGUAGE_TABS]
        return JSONResponse({"success": True, "data": tabs})

    @app.get("/api/language/html/{tab}")
    def api_language_html(tab: str):
        target = language_pages.resolve_language_tab(tab)
        if target is None:
            raise HTTPException(status_code=404, detail="Not Found")
        body = language_pages.language_html_for_embed(target)
        return HTMLResponse(
            content=body,
            media_type="text/html; charset=utf-8",
            headers={"Content-Disposition": "inline"},
        )

    games = ASSET_ROOT / "games" / "japanese-language"
    know_dir = ASSET_ROOT / "knowledge" / "japan"
    kanji_table_html = know_dir / "kanji-table.html"
    if games.is_dir():
        styles_path = games / "styles.css"
        if styles_path.is_file():

            @app.get("/styles.css")
            def games_stylesheet() -> FileResponse:
                return FileResponse(styles_path, media_type="text/css")

        js_dir = games / "js"
        if js_dir.is_dir():
            app.mount("/js", StaticFiles(directory=str(js_dir)), name="games-js")

        # Kanji wall page lives under knowledge/; Games iframe expects /games/kanji-table.html
        if kanji_table_html.is_file():

            @app.get("/games/kanji-table.html")
            def games_kanji_table_page() -> HTMLResponse:
                body = kanji_table_html.read_text(encoding="utf-8-sig")
                return HTMLResponse(content=body, media_type="text/html; charset=utf-8")

        app.mount("/games", StaticFiles(directory=str(games), html=True), name="games")
    know = ASSET_ROOT / "knowledge" / "japan"
    if know.is_dir():
        app.mount("/know", StaticFiles(directory=str(know), html=True), name="know")
    skills = ASSET_ROOT / "skills"
    if not skills.is_dir():
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
