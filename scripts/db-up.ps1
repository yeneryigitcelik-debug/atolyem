# Script to start PostgreSQL (checks for Docker first, falls back to local service)

# Check if Docker is available
$dockerAvailable = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)

if ($dockerAvailable) {
    Write-Host "Docker detected. Starting PostgreSQL container..." -ForegroundColor Cyan
    docker compose up -d postgres
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL container started successfully!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "Failed to start Docker container. Falling back to local PostgreSQL..." -ForegroundColor Yellow
    }
}

# Fallback to local PostgreSQL service
Write-Host "Checking local PostgreSQL service..." -ForegroundColor Cyan

$postgresService = Get-Service -Name "postgresql-17" -ErrorAction SilentlyContinue

if ($null -eq $postgresService) {
    # Try to find any postgres service
    $postgresService = Get-Service | Where-Object { $_.Name -like "*postgres*" } | Select-Object -First 1
}

if ($null -ne $postgresService) {
    if ($postgresService.Status -eq "Running") {
        Write-Host "PostgreSQL service is already running!" -ForegroundColor Green
        Write-Host "Service: $($postgresService.DisplayName)" -ForegroundColor Gray
        exit 0
    } else {
        Write-Host "Starting PostgreSQL service: $($postgresService.DisplayName)..." -ForegroundColor Cyan
        Start-Service -Name $postgresService.Name
        Start-Sleep -Seconds 2
        
        if ((Get-Service -Name $postgresService.Name).Status -eq "Running") {
            Write-Host "PostgreSQL service started successfully!" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "Failed to start PostgreSQL service." -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "ERROR: PostgreSQL service not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL or Docker Desktop." -ForegroundColor Yellow
    Write-Host "Install PostgreSQL: winget install -e --id PostgreSQL.PostgreSQL" -ForegroundColor Gray
    exit 1
}

