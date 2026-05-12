$files = Get-ChildItem -Path "Frontend" -Include *.tsx,*.ts,*.css -Recurse | Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch ".next" }
foreach ($f in $files) {
    $fullName = $f.FullName
    $content = [System.IO.File]::ReadAllText($fullName)
    # Case sensitive replacements first
    $content = $content.Replace('Trans<strong>Meta</strong>', 'MPE <strong>SYSTEM</strong>')
    $content = $content.Replace('TransMeta', 'MPE SYSTEM')
    # Case insensitive for other matches
    $content = [regex]::Replace($content, "transmeta", "MPE SYSTEM", "IgnoreCase")
    [System.IO.File]::WriteAllText($fullName, $content)
}
