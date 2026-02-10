$ErrorActionPreference = "Stop"
$skillDir = "$env:USERPROFILE\.claude\skills"
New-Item -ItemType Directory -Force -Path $skillDir | Out-Null
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Copy-Item "$scriptDir\skills\flow-*.md" -Destination $skillDir -Force
Write-Host ""
Write-Host "Flow plugin installed successfully!" -ForegroundColor Green
Write-Host "Skills available: /flow:init, /flow:spec, /flow:go, /flow:done, /flow:status"
Write-Host ""
Write-Host "Get started: open any project and run /flow:init"
