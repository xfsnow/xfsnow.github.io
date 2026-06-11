"""
批量修复 zh/ 下所有 HTML 的版本菜单。
将多语言版本列表替换为 "中文" 纯文本 + "English" 链接。
"""

import sys
from pathlib import Path
from bs4 import BeautifulSoup

# 将脚本所在目录加入 path，以便复用 translate_html.py 中的函数
sys.path.insert(0, str(Path(__file__).parent))
from translate_html import fix_version_menu

ZH_DIR = Path(__file__).resolve().parent.parent.parent / "manual" / "zh"

def compute_depth(zh_path: Path) -> int:
    """计算文件相对 zh/ 根的深度。
    zh/index.htm -> depth=1, zh/Foo/index.htm -> depth=2, zh/commands/Foo/index.htm -> depth=3
    """
    try:
        rel = zh_path.relative_to(ZH_DIR)
        parts = rel.parts
        # parts = ('index.htm',) -> depth=1
        # parts = ('Foo', 'index.htm') -> depth=2
        # parts = ('commands', 'Foo', 'index.htm') -> depth=3
        return len(parts)
    except ValueError:
        return 2

def main():
    html_files = sorted(ZH_DIR.rglob("*.htm"))
    print(f"Found {len(html_files)} HTML files in zh/")

    fixed = 0
    errors = 0

    for f in html_files:
        try:
            content = f.read_text(encoding="utf-8")
            soup = BeautifulSoup(content, "html.parser")

            # 检查是否有 version-menu
            version_menu = soup.find("div", class_="version-menu")
            if not version_menu:
                continue

            depth = compute_depth(f)
            fix_version_menu(soup, depth)

            f.write_text(str(soup), encoding="utf-8")
            fixed += 1
            if fixed % 50 == 0:
                print(f"  Fixed {fixed} files...")

        except Exception as e:
            errors += 1
            print(f"  ERROR: {f}: {e}")

    print(f"\nDone. Fixed: {fixed}, Errors: {errors}")

if __name__ == "__main__":
    main()
