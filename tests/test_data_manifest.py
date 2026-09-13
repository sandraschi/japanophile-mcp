"""Vendored data/ corpora manifest (skip if files absent — e.g. partial CI clone)."""
from __future__ import annotations

import pytest

from japanophile_mcp.db import DATA_DIR, REQUIRED_DATA_FILES, resolve_data_file, resolve_db


@pytest.mark.parametrize("name", REQUIRED_DATA_FILES)
def test_required_data_file(name: str) -> None:
    path = DATA_DIR / name
    if not path.is_file():
        pytest.skip(f"missing {path} — vendored corpora not present in this checkout")
    if name.endswith(".db"):
        assert resolve_db(name) is not None
    else:
        assert resolve_data_file(name) is not None
