$lines = Get-Content .\public\js\app.js
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line.Contains('{') -or $line.Contains('}')) {
        $o = ([regex]::Matches($line, '\{')).Count
        $c = ([regex]::Matches($line, '\}')).Count
        if ($o -ne $c) {
            # Let's inspect where it's unusual
        }
    }
}

# Let's see: is there any regex with } or { in app.js?
$regexes = [regex]::Matches((Get-Content .\public\js\app.js -Raw), '/[^/\n]+/g')
foreach ($r in $regexes) {
    if ($r.Value -match '\{|\}') {
        Write-Host "Regex with brace: $($r.Value)"
    }
}
