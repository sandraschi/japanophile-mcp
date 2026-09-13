"""REST LLM routes (fleet template / arxiv-mcp pilot). Mount via register_llm_routes."""

from __future__ import annotations

import asyncio
import json
from typing import Any

from fastapi import HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from japanophile_mcp.db import DATA_DIR

from ..activity_log import log_activity
from . import llm_providers


class LlmSettingsWriteIn(BaseModel):
    provider: str = Field(default="ollama")
    endpoint: str = Field(default="http://localhost:11434")
    model: str = Field(default="")
    api_key: str | None = Field(default=None)


class LlmUnloadIn(BaseModel):
    provider: str = Field(default="ollama")
    endpoint: str = Field(default="http://localhost:11434")


class LlmChatIn(BaseModel):
    provider: str = Field(...)
    model: str = Field(..., min_length=1)
    messages: list[dict[str, Any]] = Field(..., min_length=1)


class LlmInstallIn(BaseModel):
    engine: str = Field(...)


def _settings_path():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return DATA_DIR / "llm_settings.json"


def register_llm_routes(router: Any) -> None:
    """Attach /settings/llm and /llm/* routes (router prefix should be /api)."""

    @router.get("/settings/llm")
    async def api_llm_settings_get() -> dict[str, Any]:
        path = _settings_path()
        base: dict[str, Any] = {
            "provider": "ollama",
            "endpoint": "http://localhost:11434",
            "model": "",
        }
        if path.is_file():
            try:
                base.update(json.loads(path.read_text(encoding="utf-8")))
            except (json.JSONDecodeError, OSError):
                pass
        base.pop("api_key", None)
        base["keys_configured"] = llm_providers.keys_configured()
        return base

    @router.post("/settings/llm")
    async def api_llm_settings_save(body: LlmSettingsWriteIn) -> dict[str, Any]:
        try:
            llm_providers.require_provider(body.provider)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        payload = {
            "provider": body.provider,
            "endpoint": body.endpoint,
            "model": body.model,
        }
        _settings_path().write_text(json.dumps(payload, indent=2), encoding="utf-8")
        key_saved = False
        if body.api_key:
            try:
                llm_providers.save_key(body.provider, body.api_key)
                key_saved = True
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc
        switch: dict[str, Any] = {}
        if body.provider == "ollama" and body.model.strip():
            switch = await llm_providers.switch_ollama_model(body.model.strip(), body.endpoint)
        log_activity(
            "llm",
            f"settings saved provider={body.provider} model={body.model or '(empty)'}",
            meta={"key_saved": key_saved},
        )
        return {"success": True, **payload, "key_saved": key_saved, "switch": switch}

    @router.delete("/settings/llm/key")
    async def api_llm_key_delete(provider: str = Query(...)) -> dict[str, Any]:
        try:
            removed = llm_providers.delete_key(provider)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return {"success": True, "provider": provider, "removed": removed}

    @router.post("/llm/unload")
    async def api_llm_unload(body: LlmUnloadIn) -> dict[str, Any]:
        if body.provider != "ollama":
            raise HTTPException(status_code=400, detail="unload needs the ollama provider")
        switch = await llm_providers.switch_ollama_model("", body.endpoint)
        if not switch.get("engine"):
            raise HTTPException(
                status_code=502, detail="Ollama engine unreachable - start it first"
            )
        return {"success": True, "provider": body.provider, **switch}

    @router.get("/llm/loaded")
    async def api_llm_loaded(
        provider: str = Query(...), endpoint: str = Query(default="")
    ) -> dict[str, Any]:
        if provider != "ollama":
            raise HTTPException(status_code=400, detail="loaded residents need the ollama provider")
        base = endpoint.rstrip("/") or "http://localhost:11434"
        return {
            "success": True,
            "provider": provider,
            **await llm_providers.ollama_loaded(base),
        }

    @router.get("/llm/providers")
    async def api_llm_providers() -> dict[str, Any]:
        infos = llm_providers.public_provider_info()
        locals_ = [i for i in infos if i["kind"] == "local"]
        probes = await asyncio.gather(*(llm_providers.probe_local(i["id"]) for i in locals_))
        for info, (reachable, models) in zip(locals_, probes, strict=True):
            info["detected"] = reachable
            info["models"] = models
        for info in infos:
            if info["kind"] == "cloud":
                info["detected"] = info["configured"]
                info["models"] = []
        return {"providers": infos}

    @router.get("/llm/gpus")
    async def api_llm_gpus() -> dict[str, Any]:
        return {"gpus": llm_providers.gpu_vram()}

    @router.get("/llm/models")
    async def api_llm_models(provider: str = Query(...)) -> dict[str, Any]:
        try:
            return await llm_providers.list_models(provider)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @router.get("/llm/test")
    async def api_llm_test(
        provider: str = Query(...),
        model: str = Query(default=""),
        endpoint: str = Query(default=""),
    ) -> dict[str, Any]:
        try:
            return await llm_providers.test_provider(
                provider, model=model, endpoint=endpoint
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @router.post("/llm/chat")
    async def api_llm_chat(body: LlmChatIn) -> dict[str, Any]:
        try:
            content = await llm_providers.chat_complete(body.provider, body.model, body.messages)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc
        log_activity(
            "llm",
            f"chat {body.provider}/{body.model}",
            meta={"messages": len(body.messages)},
        )
        return {"provider": body.provider, "model": body.model, "content": content}

    @router.post("/llm/chat/stream")
    async def api_llm_chat_stream(body: LlmChatIn) -> StreamingResponse:
        try:
            llm_providers.require_provider(body.provider)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        if not body.model.strip():
            raise HTTPException(status_code=400, detail="Empty model name")
        log_activity(
            "llm",
            f"chat stream {body.provider}/{body.model}",
            meta={"messages": len(body.messages)},
        )
        gen = llm_providers.chat_stream(body.provider, body.model, body.messages)
        return StreamingResponse(gen, media_type="text/event-stream")

    @router.get("/llm/onboarding")
    async def api_llm_onboarding() -> dict[str, Any]:
        return llm_providers.onboarding_state()

    @router.post("/llm/install")
    async def api_llm_install(body: LlmInstallIn) -> dict[str, Any]:
        try:
            return llm_providers.start_install(body.engine.strip().lower())
        except (ValueError, RuntimeError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @router.get("/llm/install/status")
    async def api_llm_install_status(engine: str = Query(...)) -> dict[str, Any]:
        try:
            return llm_providers.install_status(engine.strip().lower())
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
