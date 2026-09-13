"""Fleet-standard /api/logs REST (query, stats, export, clear)."""

from __future__ import annotations

from typing import Any

from fastapi import Query
from fastapi.responses import Response

from ..activity_log import (
    SortOrder,
    clear_logs,
    export_logs,
    log_activity,
    log_stats,
    query_logs,
)


def register_logs_routes(router: Any) -> None:
    @router.get("/logs")
    async def logs_query(
        limit: int = Query(50, ge=1, le=500),
        offset: int = Query(0, ge=0),
        level: str | None = Query(None),
        kind: str | None = Query(None),
        search: str | None = Query(None),
        sort: str = Query("desc"),
        after_id: str | None = Query(None),
    ):
        order: SortOrder = "asc" if sort == "asc" else "desc"
        return query_logs(
            limit=limit,
            offset=offset,
            level=level,
            kind=kind,
            search=search,
            sort=order,
            after_id=after_id,
        )

    @router.get("/logs/stats")
    async def logs_stats():
        return log_stats()

    @router.get("/logs/export")
    async def logs_export(
        format: str = Query("json"),
        level: str | None = Query(None),
        kind: str | None = Query(None),
        search: str | None = Query(None),
        sort: str = Query("desc"),
    ):
        order: SortOrder = "asc" if sort == "asc" else "desc"
        if format not in ("json", "csv"):
            format = "json"
        body, media_type, filename = export_logs(
            format=format,
            level=level,
            kind=kind,
            search=search,
            sort=order,
        )
        log_activity("export", f"Logs exported as {format}", meta={"filename": filename})
        return Response(
            content=body,
            media_type=media_type,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    @router.delete("/logs")
    async def logs_clear():
        clear_logs()
        log_activity("system", "Log buffer cleared", level="WARNING")
        return {"success": True}
