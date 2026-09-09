from pathlib import Path

root = Path(__file__).resolve().parents[1]
old = '<img src="images/nurses/73Health.png" alt="73 Health logo">'
new = '<span class="partner-wordmark">73 HEALTH</span>'

changed = 0
for path in root.rglob('*.html'):
    text = path.read_text(encoding='utf-8', errors='replace')
    if old in text:
        path.write_text(text.replace(old, new), encoding='utf-8')
        changed += 1

print(f'Replaced removed 73 Health asset in {changed} HTML file(s).')
