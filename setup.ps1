$ErrorActionPreference = "Stop"
$cmdDir = "$env:USERPROFILE\.claude\commands\flow"
New-Item -ItemType Directory -Force -Path $cmdDir | Out-Null
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Copy-Item "$scriptDir\skills\flow-status.md" -Destination "$cmdDir\status.md" -Force
Copy-Item "$scriptDir\skills\flow-done.md" -Destination "$cmdDir\done.md" -Force
Copy-Item "$scriptDir\skills\flow-init.md" -Destination "$cmdDir\init.md" -Force
Copy-Item "$scriptDir\skills\flow-spec.md" -Destination "$cmdDir\spec.md" -Force
Copy-Item "$scriptDir\skills\flow-go.md" -Destination "$cmdDir\go.md" -Force
Write-Host ""
Write-Host "Flow plugin installed successfully!" -ForegroundColor Green
Write-Host "Commands available: /flow:init, /flow:spec, /flow:go, /flow:done, /flow:status"
Write-Host ""
Write-Host "Get started: open any project and run /flow:init"
