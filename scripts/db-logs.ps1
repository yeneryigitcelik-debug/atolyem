# Script to show PostgreSQL logs (checks for Docker first, falls back to local service)

# Check if Docker is available
$dockerAvailable = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)

if ($dockerAvailable) {
    Write-Host "Docker detected. Showing PostgreSQL container logs..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop following logs" -ForegroundColor Gray
    Write-Host ""
    docker compose logs -f postgres
    exit $LASTEXITCODE
}

# Fallback to local PostgreSQL service logs
Write-Host "Checking local PostgreSQL service logs..." -ForegroundColor Cyan

$postgresService = Get-Service -Name "postgresql-17" -ErrorAction SilentlyContinue

if ($null -eq $postgresService) {
    # Try to find any postgres service
    $postgresService = Get-Service | Where-Object { $_.Name -like "*postgres*" } | Select-Object -First 1
}

if ($null -ne $postgresService) {
    Write-Host "PostgreSQL Service: $($postgresService.DisplayName)" -ForegroundColor Green
    Write-Host "Status: $($postgresService.Status)" -ForegroundColor Gray
    Write-Host ""
    
    # Try to find PostgreSQL data directory from registry
    $dataDir = $null
    try {
        $regKeys = Get-ItemProperty 'HKLM:\SOFTWARE\PostgreSQL\Installations\*' -ErrorAction SilentlyContinue
        if ($regKeys) {
            $dataDir = $regKeys.DataDirectory
        }
    } catch {}
    
    # Try to find postgresql.conf to get data directory
    if (-not $dataDir) {
        $possibleConfPaths = @(
            "$env:ProgramFiles\PostgreSQL\17\data\postgresql.conf",
            "$env:ProgramData\PostgreSQL\17\data\postgresql.conf",
            "C:\Postgres\data\postgresql.conf"
        )
        
        foreach ($confPath in $possibleConfPaths) {
            if (Test-Path $confPath) {
                $dataDir = Split-Path $confPath -Parent
                break
            }
        }
    }
    
    # Try to find PostgreSQL log directory
    $possibleLogPaths = @()
    if ($dataDir) {
        $possibleLogPaths += "$dataDir\log"
        $possibleLogPaths += "$dataDir\pg_log"
    }
    
    $possibleLogPaths += @(
        "$env:ProgramFiles\PostgreSQL\17\data\log",
        "$env:ProgramFiles\PostgreSQL\17\data\pg_log",
        "$env:ProgramFiles\PostgreSQL\17\log",
        "$env:ProgramData\PostgreSQL\17\data\log",
        "$env:ProgramData\PostgreSQL\17\data\pg_log",
        "C:\Postgres\data\log",
        "C:\Postgres\data\pg_log",
        "$env:LOCALAPPDATA\PostgreSQL\17\data\log",
        "$env:LOCALAPPDATA\PostgreSQL\17\data\pg_log"
    )
    
    $logPath = $null
    foreach ($path in $possibleLogPaths) {
        if (Test-Path $path) {
            $logPath = $path
            break
        }
    }
    
    if ($null -ne $logPath) {
        Write-Host "Found log directory: $logPath" -ForegroundColor Green
        Write-Host ""
        Write-Host "Recent log files:" -ForegroundColor Cyan
        
        $logFiles = Get-ChildItem -Path $logPath -File -ErrorAction SilentlyContinue | 
            Where-Object { $_.Extension -in @('.log', '.csv') -or $_.Name -like '*log*' } |
            Sort-Object LastWriteTime -Descending | 
            Select-Object -First 5
        
        if ($logFiles.Count -gt 0) {
            $latestLog = $logFiles[0]
            Write-Host "Showing latest log: $($latestLog.Name)" -ForegroundColor Yellow
            Write-Host "Last modified: $($latestLog.LastWriteTime)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "--- Last 50 lines ---" -ForegroundColor Cyan
            Write-Host ""
            
            Get-Content -Path $latestLog.FullName -Tail 50 -ErrorAction SilentlyContinue
            
            Write-Host ""
            Write-Host "--- End of log ---" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "To follow logs in real-time, use:" -ForegroundColor Gray
            Write-Host "  Get-Content '$($latestLog.FullName)' -Wait -Tail 20" -ForegroundColor Yellow
        } else {
            Write-Host "No log files found in $logPath" -ForegroundColor Yellow
            Write-Host "Logging might be disabled. Check postgresql.conf:" -ForegroundColor Gray
            Write-Host "  logging_collector = on" -ForegroundColor Gray
            Write-Host "  log_directory = 'log' (or 'pg_log')" -ForegroundColor Gray
        }
    } else {
        Write-Host "Could not find PostgreSQL log directory." -ForegroundColor Yellow
        if ($dataDir) {
            Write-Host "Data directory found: $dataDir" -ForegroundColor Gray
            Write-Host "Checking if logging is enabled in postgresql.conf..." -ForegroundColor Gray
            
            $confFile = Join-Path $dataDir "postgresql.conf"
            if (Test-Path $confFile) {
                $loggingEnabled = Select-String -Path $confFile -Pattern "logging_collector\s*=\s*on" -Quiet
                if (-not $loggingEnabled) {
                    Write-Host "Logging appears to be disabled in postgresql.conf" -ForegroundColor Yellow
                    Write-Host "To enable, set: logging_collector = on" -ForegroundColor Gray
                }
            }
        }
        Write-Host ""
    }
    
    # Check database connection status
    Write-Host "--- Database Connection Status ---" -ForegroundColor Cyan
    Write-Host ""
    
    $psqlAvailable = $null -ne (Get-Command psql -ErrorAction SilentlyContinue)
    if ($psqlAvailable) {
        try {
            # Try to connect and get version
            $pgVersion = & psql --version 2>&1
            Write-Host "PostgreSQL Client: $pgVersion" -ForegroundColor Green
            
            # Try to connect to database (if .env exists)
            if (Test-Path .env) {
                $envContent = Get-Content .env -Raw
                if ($envContent -match 'DATABASE_URL="([^"]+)"') {
                    $dbUrl = $matches[1]
                    Write-Host "Database URL found in .env" -ForegroundColor Gray
                    Write-Host "To test connection: psql $dbUrl" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "Could not check PostgreSQL client: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "psql client not found in PATH" -ForegroundColor Yellow
        Write-Host "Add PostgreSQL bin directory to PATH to use psql" -ForegroundColor Gray
    }
    
    Write-Host ""
    
    # Also show Windows Event Log entries for PostgreSQL
    Write-Host "--- Windows Event Log (Recent PostgreSQL events) ---" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        # Get events from the last 24 hours
        $startTime = (Get-Date).AddHours(-24)
        $events = Get-WinEvent -FilterHashtable @{
            LogName = 'Application'
            StartTime = $startTime
        } -ErrorAction SilentlyContinue | 
            Where-Object { 
                $_.ProviderName -like "*PostgreSQL*" -or 
                ($_.Message -like "*postgres*" -and $_.Message -notlike "*postgresql*")
            } | 
            Select-Object -First 5 -ErrorAction SilentlyContinue
        
        if ($events -and $events.Count -gt 0) {
            foreach ($event in $events) {
                $message = $event.Message -replace "`r`n", " " -replace "`n", " "
                if ($message.Length -gt 100) { $message = $message.Substring(0, 100) + "..." }
                Write-Host "[$($event.TimeCreated.ToString('yyyy-MM-dd HH:mm:ss'))] $($event.LevelDisplayName): $message" -ForegroundColor Gray
            }
        } else {
            Write-Host "No recent PostgreSQL events in Windows Event Log (last 24 hours)." -ForegroundColor Gray
        }
    } catch {
        Write-Host "Could not read Windows Event Log: $_" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Tip: To find your PostgreSQL data directory, check:" -ForegroundColor Gray
    Write-Host "  - postgresql.conf file (log_directory setting)" -ForegroundColor Gray
    Write-Host "  - Or run: Get-ItemProperty 'HKLM:\SOFTWARE\PostgreSQL\Installations\*' | Select-Object DataDirectory" -ForegroundColor Gray
    
} else {
    Write-Host "ERROR: PostgreSQL service not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL or Docker Desktop." -ForegroundColor Yellow
    exit 1
}

