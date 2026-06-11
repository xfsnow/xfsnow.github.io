#!/usr/bin/env python3
"""
Scan site HTML files and replace href attributes that use javascript:... with the
URL found in the `tppabs` attribute on the same <a> tag.

Writes files back in-place and prints a summary of changes.
"""
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

ANCHOR_RE = re.compile(r"<a\b[^>]*>", re.IGNORECASE)
TPPABS_RE = re.compile(r"\btppabs\s*=\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s>]+))", re.IGNORECASE)
HREF_RE = re.compile(r"\bhref\s*=\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s>]+))", re.IGNORECASE)

def extract_attr_value(m):
    if not m:
        return None
    return m.group(1) or m.group(2) or m.group(3)

def replace_anchor_tag(tag: str) -> (str, bool):
    """Return (new_tag, changed)"""
    tppabs_m = TPPABS_RE.search(tag)
    href_m = HREF_RE.search(tag)
    tppabs = extract_attr_value(tppabs_m)
    href = extract_attr_value(href_m)

    if not href or not tppabs:
        return tag, False

    if href.strip().lower().startswith('javascript:'):
        # Replace the href attribute with the tppabs value (use double quotes)
        new_tag = HREF_RE.sub('href="%s"' % tppabs, tag, count=1)
        return new_tag, new_tag != tag

    return tag, False

def process_file(path: Path) -> int:
    text = path.read_text(encoding='utf-8', errors='replace')
    changed = False
    replacements = 0

    def repl(m):
        nonlocal replacements, changed
        tag = m.group(0)
        new_tag, did = replace_anchor_tag(tag)
        if did:
            replacements += 1
            changed = True
        return new_tag

    new_text = ANCHOR_RE.sub(repl, text)
    if changed and new_text != text:
        path.write_text(new_text, encoding='utf-8')
    return replacements

def find_html_files(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        for fn in filenames:
            if fn.lower().endswith(('.htm', '.html')):
                yield Path(dirpath) / fn

def main():
    total_files = 0
    total_repls = 0
    for f in find_html_files(ROOT):
        repls = process_file(f)
        if repls:
            print(f"Updated {f.relative_to(ROOT)}: {repls} replacement(s)")
            total_files += 1
            total_repls += repls

    print('-' * 40)
    print(f"Files changed: {total_files}")
    print(f"Total replacements: {total_repls}")

if __name__ == '__main__':
    main()
