# Fix all remaining dynamic route files
$filesToFix = @(
    "src\app\api\users\[id]\route.ts",
    "src\app\api\vouchers\[id]\route.ts",
    "src\app\api\voucher-types\[id]\route.ts",
    "src\app\api\inventory\items\[id]\route.ts"
)

foreach ($file in $filesToFix) {
    $fullPath = $file
    if (Test-Path $fullPath) {
        Write-Host "Processing $file..."
        $content = Get-Content $fullPath -Raw
        
        # Replace all occurrences of the old pattern
        $oldPattern = '\{ params \}: \{ params: \{ id: string \} \}'
        $newPattern = 'props: { params: Promise<{ id: string }> }'
        $content = $content -replace $oldPattern, $newPattern
        
        # Now add 'const params = await props.params;' after each function signature
        # Match function declarations that have the new pattern
        $functionPattern = '(export async function (?:GET|PUT|DELETE|POST)\([^)]+props: \{ params: Promise<\{ id: string \}> \}\s*\)\s*\{)(\s*)(const session)'
        $replacement = '$1$2const params = await props.params;$2$3'
        $content = $content -replace $functionPattern, $replacement
        
        Set-Content $fullPath -Value $content -NoNewline
        Write-Host "Fixed $file"
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "Done!"
