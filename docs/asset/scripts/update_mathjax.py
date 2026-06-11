import re
from pathlib import Path

root = Path('d:/Study/ggb/doc')
pattern_src = re.compile(r'src\s*=\s*"(?:\.\./)+cdn\.jsdelivr\.net/npm/mathjax@4\.1\.1/tex-chtml\.js"')
pattern_tpp = re.compile(r'tppabs\s*=\s*"https?://cdn\.jsdelivr\.net/npm/mathjax@4\.1\.1/tex-chtml\.js"')
pattern_any = re.compile(r'mathjax@4\.1\.1/tex-chtml\.js')

replacement_src = 'src="https://cdn.jsdelivr.net/npm/mathjax@4.1.2/tex-chtml.js"'
replacement_tpp = 'tppabs="https://cdn.jsdelivr.net/npm/mathjax@4.1.2/tex-chtml.js"'
replacement_any = 'mathjax@4.1.2/tex-chtml.js'

changed_files = []
for p in root.rglob('*.htm'):
    # try utf-8, fall back to cp1252
    # read with fallback and replace errors to avoid decode exceptions
    text = p.read_text(encoding='utf-8', errors='replace')
    enc = 'utf-8'
    new = pattern_src.sub(replacement_src, text)
    new = pattern_tpp.sub(replacement_tpp, new)
    new = pattern_any.sub(replacement_any, new)
    if new != text:
        p.write_text(new, encoding=enc)
        changed_files.append(str(p))

print(f"Updated {len(changed_files)} files:")
for f in changed_files:
    print(f)
