"""MCP tool harness REST routes (fleet pattern, see mcp-central-docs/templates/tools-page)."""

from __future__ import annotations

import json
from typing import Annotated
from urllib.parse import unquote

from fastapi import Body, FastAPI, HTTPException
from fastmcp import FastMCP

from .activity_log import log_activity


def _tool_row(tool) -> dict:
    params = (
        tool.parameters
        if isinstance(getattr(tool, "parameters", None), dict)
        else {"type": "object", "properties": {}}
    )
    ann = getattr(tool, "annotations", None)
    annotations = (
        ann.model_dump() if hasattr(ann, "model_dump") else (ann if isinstance(ann, dict) else None)
    )
    tags = getattr(tool, "tags", None) or []
    return {
        "name": tool.name,
        "title": getattr(tool, "title", None),
        "description": (getattr(tool, "description", None) or "").strip(),
        "parameters": params,
        "annotations": annotations,
        "tags": sorted(tags) if tags else [],
        "needs_confirm": False,
    }


def _serialize_tool_result(result):
    structured = getattr(result, "structured_content", None)
    if structured is not None:
        return structured
    blocks = getattr(result, "content", None) or []
    texts = []
    for block in blocks:
        text = getattr(block, "text", None)
        texts.append(text if text is not None else str(block))
    if len(texts) == 1:
        try:
            return json.loads(texts[0])
        except (TypeError, json.JSONDecodeError):
            return {"text": texts[0]}
    return {"text": "\n".join(str(item) for item in texts)}


def mount_tools_routes(app: FastAPI, mcp_app: FastMCP) -> None:
    @app.get("/api/tools")
    async def list_tools():
        tools = await mcp_app.list_tools()
        rows = [_tool_row(tool) for tool in tools]
        rows.sort(key=lambda item: item["name"])
        log_activity("api", f"tools catalog ({len(rows)} tools)")
        return {"tools": rows, "count": len(rows)}

    @app.get("/api/tools/{tool_name}")
    async def get_tool(tool_name: str):
        wanted = unquote(tool_name)
        tools = await mcp_app.list_tools()
        tool = next((item for item in tools if item.name == wanted), None)
        if tool is None:
            raise HTTPException(status_code=404, detail=f"Unknown tool: {wanted}")
        return {"tool": _tool_row(tool)}

    @app.post("/api/tools/{tool_name}")
    async def invoke_tool(tool_name: str, payload: Annotated[dict, Body()]):
        wanted = unquote(tool_name)
        tools = await mcp_app.list_tools()
        tool = next((item for item in tools if item.name == wanted), None)
        if tool is None:
            raise HTTPException(status_code=404, detail=f"Unknown tool: {wanted}")
        arguments = payload.get("arguments")
        if arguments is None:
            arguments = {k: v for k, v in payload.items() if k not in ("confirm", "arguments")}
        if not isinstance(arguments, dict):
            raise HTTPException(status_code=400, detail="arguments must be an object")
        try:
            result = await tool.run(arguments)
            log_activity(
                "tool_call",
                f"web invoke {wanted}",
                meta={"args": list(arguments.keys())},
            )
            return {"success": True, "tool": wanted, "result": _serialize_tool_result(result)}
        except HTTPException as exc:
            log_activity(
                "tool_call",
                f"web invoke {wanted} HTTP {exc.status_code}",
                level="WARNING" if exc.status_code < 500 else "ERROR",
                meta={"detail": str(exc.detail)[:200]},
            )
            raise
        except Exception as exc:
            log_activity(
                "tool_call",
                f"web invoke {wanted} failed: {exc}",
                level="ERROR",
            )
            raise HTTPException(status_code=400, detail=str(exc)) from exc
