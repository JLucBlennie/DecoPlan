<#
  Usage :
    .\scripts\build-all.ps1 -All
    .\scripts\build-all.ps1 -Android -Windows
    .\scripts\build-all.ps1 -Linux
    .\scripts\build-all.ps1 -Android -AndroidProfile preview -NoWait
#>
[CmdletBinding()]
param(
    [switch]$All,
    [switch]$Android,
    [switch]$Windows,
    [switch]$Linux,
    [string]$AndroidProfile = 'production',
    [switch]$NoWait,                         # EAS : ne pas attendre la fin du build cloud
    [string]$WslDistro      = 'Ubuntu',
    [string]$WslProjectDir  = '~/DecoPlan',
    [string]$OutputDir      = 'D:\Dev\releases'
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

if ($All) {
    $Android = $true
    $Windows = $true
    $Linux   = $true
}
if (-not ($Android -or $Windows -or $Linux)) {
    Write-Host "Aucune cible. Utilise -All, -Android, -Windows et/ou -Linux." -ForegroundColor Yellow
    exit 1
}

function Invoke-Step {
    param([string]$Title, [scriptblock]$Action)
    Write-Host "`n=== $Title ===" -ForegroundColor Cyan
    $sw = [Diagnostics.Stopwatch]::StartNew()
    & $Action
    if ($LASTEXITCODE -ne 0) { throw "Échec : $Title (code $LASTEXITCODE)" }
    Write-Host "OK : $Title ($([int]$sw.Elapsed.TotalSeconds) s)" -ForegroundColor Green
}

# --- Contrôles préalables -------------------------------------------------
if (git status --porcelain) {
    Write-Warning "Modifications non commitées : elles seront dans les builds Android/Windows, pas dans le build Linux."
}
$ahead = git rev-list --count '@{u}..HEAD' 2>$null
if ($Linux -and $ahead -gt 0) {
    Write-Warning "$ahead commit(s) non poussé(s) : le build Linux (git pull dans WSL) ne les verra pas."
}

# --- Android (EAS, build dans le cloud) -----------------------------------
if ($Android) {
    $easArgs = @('build', '--platform', 'android', '--profile', $AndroidProfile, '--non-interactive')
    if ($NoWait) { $easArgs += '--no-wait' }
    Invoke-Step "Android (EAS, profil $AndroidProfile)" { eas @easArgs }
}

# --- Windows (Tauri) -------------------------------------------------------
if ($Windows) {
    Invoke-Step "Windows (Tauri)" { npm run desktop:build }

    $targetDir = if ($env:CARGO_TARGET_DIR) { $env:CARGO_TARGET_DIR }
                 else { Join-Path $ProjectRoot 'src-tauri\target' }
    $bundleDir = Join-Path $targetDir 'release\bundle'
    $dest      = Join-Path $OutputDir 'windows'
    New-Item -ItemType Directory -Force $dest | Out-Null
    Get-ChildItem $bundleDir -Recurse -Include *.exe, *.msi |
        Where-Object { $_.FullName -match '\\(nsis|msi)\\' } |
        Copy-Item -Destination $dest -Force
    $exe = Join-Path $targetDir 'release\decoplan.exe'   # nom défini par mainBinaryName
    if (Test-Path $exe) {
        Copy-Item $exe -Destination $dest -Force
    }
    Write-Host "Installeurs Windows copiés dans $dest"
}

# --- Linux (WSL) -----------------------------------------------------------
if ($Linux) {
    $drive    = $OutputDir.Substring(0, 1).ToLower()
    $wslOut   = "/mnt/$drive" + ($OutputDir.Substring(2) -replace '\\', '/') + '/linux'

    $bashScript = @'
set -e
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
. "$HOME/.cargo/env"
cd PROJECT_DIR
git pull --ff-only
npm ci
npm run desktop:build
mkdir -p "OUT_DIR"
cp src-tauri/target/release/bundle/deb/*.deb "OUT_DIR"/
cp src-tauri/target/release/bundle/appimage/*.AppImage "OUT_DIR"/
cp src-tauri/target/release/decoplan "OUT_DIR"/
'@
    $bashScript = $bashScript.Replace('PROJECT_DIR', $WslProjectDir).Replace('OUT_DIR', $wslOut) -replace "`r", ''

    Invoke-Step "Linux (WSL, $WslDistro)" { $bashScript | wsl -d $WslDistro -- bash -s }
    Write-Host "Paquets Linux copiés dans $OutputDir\linux"
}

Write-Host "`nTerminé." -ForegroundColor Green