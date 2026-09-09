from pathlib import Path

root = Path(__file__).resolve().parents[1]
needle = 'https://teledoctorsa.co.za//images/'
replacement = 'https://teledoctorsa.co.za/images/'
changed = 0

for path in root.rglob('*.html'):
    text = path.read_text(encoding='utf-8', errors='replace')
    if needle in text:
        path.write_text(text.replace(needle, replacement), encoding='utf-8')
        changed += 1

remaining = []
for path in root.rglob('*.html'):
    if needle in path.read_text(encoding='utf-8', errors='ignore'):
        remaining.append(str(path.relative_to(root)))

if remaining:
    raise SystemExit('Double-slash social image URLs remain in: ' + ', '.join(remaining))

print(f'Normalized social image URLs in {changed} HTML file(s).')
