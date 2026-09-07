# Migration application script
$ErrorActionPreference = "Stop"

$infraProject = "D:\Project\SoleraBackend\Solera.Infrastructure"
$apiProject = "D:\Project\SoleraBackend\Solera.API"

Write-Host "Building Infrastructure project..." -ForegroundColor Cyan
dotnet build "$infraProject" | Out-Null

Write-Host "Adding new migration..." -ForegroundColor Cyan
cd "$infraProject"
dotnet ef migrations add UpdateDatabase -s "$apiProject" 2>&1 | Out-Null

Write-Host "Updating database..." -ForegroundColor Cyan
dotnet ef database update -p "$infraProject" -s "$apiProject" 2>&1

Write-Host "Migration completed successfully!" -ForegroundColor Green