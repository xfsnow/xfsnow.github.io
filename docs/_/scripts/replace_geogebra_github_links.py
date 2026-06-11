#!/usr/bin/env python3
"""Replace href values that start with https://geogebra.github.io/{path} to "/{path}".

Usage: run from repository root:
    python _/scripts/replace_geogebra_github_links.py
"""
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# Match href='https://geogebra.github.io/<path>' or with double quotes, capture the path
HREF_GH_RE = re.compile(r"\bhref\s*=\s*(?P<q>\'|\")\s*https?://geogebra\.github\.io(?P<path>/[^\"'>\s]*)\s*(?P=q)", re.IGNORECASE)

def process_file(path: Path) -> int:
    try:
        text = path.read_text(encoding='utf-8', errors='replace')
    except Exception:
        return 0

    def repl(m):
        q = m.group('q')
        p = m.group('path')
        return f'href={q}{p}{q}'

    new_text, n = HREF_GH_RE.subn(repl, text)
    if n:
        path.write_text(new_text, encoding='utf-8')
    return n

def find_html_files(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        for fn in filenames:
            if fn.lower().endswith(('.htm', '.html')):
                yield Path(dirpath) / fn

def main():
    total_files = 0
    total_repls = 0
    for f in find_html_files(ROOT):
        n = process_file(f)
        if n:
            print(f"Updated {f.relative_to(ROOT)}: {n} replacement(s)")
            total_files += 1
            total_repls += n

    print('-' * 40)
    print(f"Files changed: {total_files}")
    print(f"Total replacements: {total_repls}")

if __name__ == '__main__':
    main()
