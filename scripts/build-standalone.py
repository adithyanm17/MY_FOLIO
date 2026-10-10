"""Rebuild the shareable HTML from the website's current source and assets."""
from base64 import b64encode
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'styles.css').read_text(encoding='utf-8')
js = (root / 'script.js').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n</style>')
html = html.replace('<script src="script.js" defer></script>', '')
html = html.replace('</body>', '<script>\n' + js + '\n</script>\n</body>')
for filename, mime, reference in [
    ('Adithyan.jpg', 'image/jpeg', 'Adithyan.jpg'),
    ('Adithyan M.pdf', 'application/pdf', 'Adithyan%20M.pdf'),
]:
    data = b64encode((root / filename).read_bytes()).decode('ascii')
    html = html.replace('"' + reference + '"', '"data:' + mime + ';base64,' + data + '"')
output = root / 'Adithyan M Portfolio (Standalone).html'
output.write_text('\n'.join(line.rstrip() for line in html.splitlines()) + '\n', encoding='utf-8')
print('Updated standalone portfolio with embedded portrait and current resume.')
