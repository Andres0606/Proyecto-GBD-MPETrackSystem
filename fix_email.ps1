$files = Get-ChildItem -Path "Frontend" -Include *.tsx,*.ts,*.css -Recurse | Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch ".next" }
foreach ($f in $files) {
    $fullName = $f.FullName
    $content = [System.IO.File]::ReadAllText($fullName)
    $content = $content.Replace('MPE SYSTEM@', 'mpesystem@')
    [System.IO.File]::WriteAllText($fullName, $content)
}
