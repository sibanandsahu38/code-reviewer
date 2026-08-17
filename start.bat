@echo off
title AI Code Review Buddy Server
cd /d "%~dp0"
echo Starting AI Code Review Buddy on http://localhost:3000 ...
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
