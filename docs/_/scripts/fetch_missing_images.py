#!/usr/bin/env python3
"""
Scan all .htm/.html files, find <img src="..._images/..."> entries, and fetch any
images that are missing locally from https://geogebra.github.io/<path-to-image>.

Writes files into the same relative location under the repo root.

Usage:
    python _/scripts/fetch_missing_images.py [--dry-run]
"""
from pathlib import Path
import os
import re
import sys
import urllib.request
import urllib.error

ROOT = Path(__file__).resolve().parents[2]
IMG_RE = re.compile(r'<img\b[^>]*\bsrc\s*=\s*(?P<q>"|\')(?P<src>[^"\']+)(?P=q)[^>]*>', re.IGNORECASE)

def find_html_files(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        for fn in filenames:
            if fn.lower().endswith(('.htm', '.html')):
                yield Path(dirpath) / fn

def resolve_paths(html_file: Path, src: str):
    src = src.strip()
    if src.startswith(('http://','https://','//','data:')):
        return None, None

    if src.startswith('/'):
        local = ROOT / src.lstrip('/')
    else:
        local = (html_file.parent / src).resolve()

    try:
        rel = local.relative_to(ROOT)
    except Exception:
        # Can't map into repo root; skip
        return local, None

    web_url = 'https://geogebra.github.io/' + rel.as_posix()
    return local, web_url

def fetch_url(url: str, target: Path, dry_run: bool=False) -> bool:
    if dry_run:
        print(f"Would fetch: {url} -> {target}")
        return True
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'fetch-missing-images/1.0'
        })
        with urllib.request.urlopen(req, timeout=20) as rsp:
            data = rsp.read()
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        return True
    except urllib.error.HTTPError as e:
        print(f"HTTP error {e.code} fetching {url}")
    except urllib.error.URLError as e:
        print(f"URL error fetching {url}: {e}")
    except Exception as e:
        print(f"Error fetching {url}: {e}")
    return False

def main():
    dry_run = '--dry-run' in sys.argv or '-n' in sys.argv
    seen = set()
    fetched = 0
    skipped_existing = 0
    failed = 0

    for f in find_html_files(ROOT):
        try:
            txt = f.read_text(encoding='utf-8', errors='replace')
        except Exception:
            continue
        for m in IMG_RE.finditer(txt):
            src = m.group('src')
            if '_images' not in src and '/_images' not in src:
                continue
            local, web = resolve_paths(f, src)
            if local is None or web is None:
                continue
            key = str(local).lower()
            if key in seen:
                continue
            seen.add(key)
            if local.exists():
                skipped_existing += 1
                continue
            print(f"Missing: {local.relative_to(ROOT)} -> fetching {web}")
            ok = fetch_url(web, local, dry_run=dry_run)
            if ok:
                fetched += 1
            else:
                failed += 1

    print('-' * 40)
    print(f"Images fetched: {fetched}")
    print(f"Already existed/skipped: {skipped_existing}")
    print(f"Failed fetches: {failed}")

if __name__ == '__main__':
    main()
