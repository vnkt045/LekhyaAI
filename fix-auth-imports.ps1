Get-ChildItem -Path "src/app/api" -Recurse -Filter "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "from '../auth/\[\.\.\.nextauth\]/route'", "from '@/lib/auth'"
    $content = $content -replace "from '../../auth/\[\.\.\.nextauth\]/route'", "from '@/lib/auth'"
    $content = $content -replace "from '../../../auth/\[\.\.\.nextauth\]/route'", "from '@/lib/auth'"
    Set-Content $_.FullName -Value $content -NoNewline
}
Write-Host "Auth imports fixed successfully!"
