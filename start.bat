@echo off
REM japanophile-mcp double-click wrapper - delegates to start.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
