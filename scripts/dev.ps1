$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

Write-Host "Starting backend on http://localhost:8080"
Start-Process powershell -WindowStyle Hidden -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\backend'; mvn spring-boot:run"
)

Write-Host "Starting frontend on http://localhost:5173"
Start-Process powershell -WindowStyle Hidden -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\frontend'; npm run dev"
)
