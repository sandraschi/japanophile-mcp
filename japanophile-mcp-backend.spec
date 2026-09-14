# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for japanophile-mcp backend sidecar (Tauri resources)."""
import os
import sys

site_pkgs = os.path.abspath(".venv/Lib/site-packages")
if site_pkgs not in sys.path:
    sys.path.insert(0, site_pkgs)

from PyInstaller.utils.hooks import copy_metadata

datas = [
    ("src/japanophile_mcp", "japanophile_mcp"),
    ("assets/seed", "japanophile_assets/seed"),
    ("assets/knowledge", "japanophile_assets/knowledge"),
    ("assets/language", "japanophile_assets/language"),
    ("assets/games", "japanophile_assets/games"),
    ("skills", "japanophile_assets/skills"),
]
for _corpus in ("data/kanji.db", "data/wakan_vocab.json"):
    if os.path.isfile(_corpus):
        datas.append((_corpus, "japanophile_assets/data"))
for pkg in ("fastmcp", "fastapi", "uvicorn", "pydantic", "starlette", "httpx"):
    try:
        datas += copy_metadata(pkg)
    except Exception:
        pass

hiddenimports = [
    "uvicorn.logging",
    "uvicorn.loops",
    "uvicorn.loops.asyncio",
    "uvicorn.protocols",
    "uvicorn.protocols.http",
    "uvicorn.protocols.http.httptools_impl",
    "uvicorn.protocols.http.h11_impl",
    "uvicorn.lifespan",
    "uvicorn.lifespan.on",
    "japanophile_mcp.server",
    "japanophile_mcp.http",
    "japanophile_mcp.compat",
    "japanophile_mcp.db",
]

a = Analysis(
    ["run_server.py"],
    pathex=["src", site_pkgs],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=["tkinter", "matplotlib", "pandas", "scipy", "torch", "tensorflow"],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name="japanophile-mcp-backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
