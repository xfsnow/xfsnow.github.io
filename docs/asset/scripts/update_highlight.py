import re
from pathlib import Path

root = Path('d:/Study/ggb/doc')
pattern = re.compile(r'<script[^>]*?/js/vendor/highlight\.js[^>]*?></script>', re.IGNORECASE)
replacement = '<script async src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>'

changed = []
for p in root.rglob('*.htm'):
    text = p.read_text(encoding='utf-8', errors='replace')
    new = pattern.sub(replacement, text)
    if new != text:
        p.write_text(new, encoding='utf-8')
        changed.append(str(p))

print(f"Updated {len(changed)} files:")
for f in changed:
    print(f)
