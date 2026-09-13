"""REST routes for user preferences."""

from __future__ import annotations

from typing import Any

from fastapi import HTTPException
from pydantic import BaseModel, Field

from ..activity_log import log_activity
from . import user_prefs


class UserPrefsIn(BaseModel):
    display_name: str | None = Field(default=None, max_length=80)
    default_jlpt_level: str | None = Field(default=None)
    progress_session_id: str | None = Field(default=None, max_length=64)


def register_user_prefs_routes(router: Any) -> None:
    @router.get("/user/prefs")
    async def api_user_prefs_get() -> dict[str, Any]:
        prefs = user_prefs.load_prefs()
        return {
            "success": True,
            "prefs": prefs,
            "quiz_levels": user_prefs.quiz_levels_from_study(prefs["default_jlpt_level"]),
        }

    @router.post("/user/prefs")
    async def api_user_prefs_save(body: UserPrefsIn) -> dict[str, Any]:
        payload = body.model_dump(exclude_none=True)
        try:
            saved = user_prefs.save_prefs(payload)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        log_activity(
            "system",
            f"user prefs updated jlpt={saved.get('default_jlpt_level')}",
            meta={"session": saved.get("progress_session_id")},
        )
        return {
            "success": True,
            "prefs": saved,
            "quiz_levels": user_prefs.quiz_levels_from_study(saved["default_jlpt_level"]),
        }
