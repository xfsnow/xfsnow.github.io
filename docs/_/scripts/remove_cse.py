import re
from pathlib import Path

root = Path('d:/Study/ggb/doc')
pattern = re.compile(r'<script[^>]*cse\.google\.com/cse\.js[^>]*?>\s*</script>\s*', re.IGNORECASE | re.DOTALL)

changed = []
for p in root.rglob('*.htm'):
    text = p.read_text(encoding='utf-8', errors='replace')
    new = pattern.sub('', text)
    if new != text:
        p.write_text(new, encoding='utf-8')
        changed.append(str(p))

print(f"Removed CSE script from {len(changed)} files:")
for f in changed:
    print(f)
