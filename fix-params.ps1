# Fix Next.js 16 params Promise issue in all dynamic routes
$files = @(
    "src\app\api\vouchers\[id]\route.ts",
    "src\app\api\voucher-types\[id]\route.ts",
    "src\app\api\users\[id]\route.ts",
    "src\app\api\inventory\[id]\route.ts",
    "src\app\api\inventory\items\[id]\route.ts"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "Fixing $file..."
        $content = Get-Content $fullPath -Raw
        
        # Replace the old pattern with new pattern
        $content = $content -replace '\{ params \}: \{ params: \{ id: string \} \}', 'props: { params: Promise<{ id: string }> }'
        
        # Add await params line after the function signature
        # This regex finds function declarations and adds the await line
        $content = $content -replace '(export async function (?:GET|PUT|DELETE|POST)\([^)]+props: \{ params: Promise<\{ id: string \}> \}\s*\)\s*\{)', "`$1`r`n    const params = await props.params;"
        
        Set-Content $fullPath -Value $content -NoNewline
        Write-Host "Fixed $file"
    }
}

Write-Host "All files fixed!"
