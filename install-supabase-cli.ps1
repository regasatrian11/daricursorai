# PowerShell script to install Supabase CLI
# Run this script as Administrator

Write-Host "Installing Supabase CLI..." -ForegroundColor Green

# Method 1: Try to install via Scoop
try {
    Write-Host "Trying to install via Scoop..." -ForegroundColor Yellow
    
    # Check if Scoop is installed
    if (!(Get-Command scoop -ErrorAction SilentlyContinue)) {
        Write-Host "Installing Scoop..." -ForegroundColor Yellow
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
    }
    
    # Add Supabase bucket
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    
    # Install Supabase CLI
    scoop install supabase
    
    Write-Host "✅ Supabase CLI installed via Scoop!" -ForegroundColor Green
    supabase --version
    
} catch {
    Write-Host "❌ Scoop installation failed, trying alternative method..." -ForegroundColor Red
    
    # Method 2: Try to install via Chocolatey
    try {
        Write-Host "Trying to install via Chocolatey..." -ForegroundColor Yellow
        
        # Check if Chocolatey is installed
        if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
            Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        }
        
        # Install Supabase CLI
        choco install supabase -y
        
        Write-Host "✅ Supabase CLI installed via Chocolatey!" -ForegroundColor Green
        supabase --version
        
    } catch {
        Write-Host "❌ Chocolatey installation failed, trying manual download..." -ForegroundColor Red
        
        # Method 3: Manual download
        try {
            Write-Host "Downloading Supabase CLI manually..." -ForegroundColor Yellow
            
            # Create directory for Supabase CLI
            $supabaseDir = "$env:USERPROFILE\supabase-cli"
            if (!(Test-Path $supabaseDir)) {
                New-Item -ItemType Directory -Path $supabaseDir -Force
            }
            
            # Download the latest release
            $releases = Invoke-RestMethod -Uri "https://api.github.com/repos/supabase/cli/releases/latest"
            $asset = $releases.assets | Where-Object { $_.name -like "*windows*amd64*" } | Select-Object -First 1
            
            if ($asset) {
                $downloadUrl = $asset.browser_download_url
                $outputPath = "$supabaseDir\supabase.exe"
                
                Write-Host "Downloading from: $downloadUrl" -ForegroundColor Yellow
                Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath
                
                # Add to PATH
                $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
                if ($currentPath -notlike "*$supabaseDir*") {
                    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$supabaseDir", "User")
                }
                
                Write-Host "✅ Supabase CLI downloaded manually!" -ForegroundColor Green
                Write-Host "Please restart your terminal and run: supabase --version" -ForegroundColor Yellow
            } else {
                Write-Host "❌ Could not find Windows binary for Supabase CLI" -ForegroundColor Red
            }
            
        } catch {
            Write-Host "❌ Manual download failed" -ForegroundColor Red
            Write-Host "Please follow the manual installation instructions in MIGRATION_INSTRUCTIONS.md" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Restart your terminal" -ForegroundColor White
Write-Host "2. Run: supabase --version" -ForegroundColor White
Write-Host "3. Or follow the manual instructions in MIGRATION_INSTRUCTIONS.md" -ForegroundColor White
