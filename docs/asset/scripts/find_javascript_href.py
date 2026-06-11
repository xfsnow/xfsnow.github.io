#!/usr/bin/env python3
import os
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]

PAT = re.compile(r'href\s*=\s*(?:"|\')\s*(javascript:[^"\']*)', re.IGNORECASE | re.DOTALL)

def find_html_files(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        for fn in filenames:
            if fn.lower().endswith(('.htm', '.html')):
                yield Path(dirpath) / fn

def scan_file(path: Path):
    results = []
    try:
        text = path.read_text(encoding='utf-8', errors='replace')
    except Exception:
        return results
    # search whole text for href attributes containing javascript: (may span lines)
    for m in PAT.finditer(text):
        # compute approximate line number
        start = m.start(1)
        line_no = text.count('\n', 0, start) + 1
        snippet = m.group(0).replace('\n', ' ').strip()
        results.append((line_no, snippet))
    return results

def main():
    total = 0
    for f in find_html_files(ROOT):
        res = scan_file(f)
        if res:
            print(f"File: {f.relative_to(ROOT)}")
            for ln, snippet in res:
                print(f"  L{ln}: {snippet}")
            total += len(res)
    print('-'*40)
    print(f"Matches: {total}")

if __name__ == '__main__':
    main()
