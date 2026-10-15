# Cetak strategi.html ke A4 PDF via WeasyPrint
# Pemakaian: .\print-strategi.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Fontconfig Windows sering tak punya config bawaan → tunjuk ke fonts.conf lokal
$env:FONTCONFIG_FILE = Join-Path $env:TEMP "opencode\fonts.conf"
if (-not (Test-Path $env:FONTCONFIG_FILE)) {
    $env:FONTCONFIG_FILE = "$PSScriptRoot\fonts.conf"
}

weasyprint strategi.html strategi.pdf
if ($LASTEXITCODE -ne 0) { throw "WeasyPrint gagal (exit $LASTEXITCODE)" }

$pdf = Get-Item strategi.pdf
Write-Host "OK: $($pdf.FullName) ($([math]::Round($pdf.Length/1KB)) KB)"
