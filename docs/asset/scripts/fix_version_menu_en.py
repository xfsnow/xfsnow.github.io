"""
批量修复 /en/ 下所有页面的版本菜单：
将多语言列表简化为 "English" 纯文本 + "中文" 链接。

中文链接路径利用 page-versions 的 data-en 属性推算：
  data-en="tools/Move" -> 相对路径 ../zh/tools/Move/
"""

import sys
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString

# 目录
EN_DIR = Path(__file__).resolve().parent.parent.parent / "manual" / "en"


def compute_depth(en_path: Path) -> int:
    """计算文件相对 en/ 根的深度。
    en/index.htm -> depth=1, en/Foo/index.htm -> depth=2, en/tools/Foo/index.htm -> depth=3
    """
    try:
        rel = en_path.relative_to(EN_DIR)
        parts = rel.parts
        return len(parts)
    except ValueError:
        return 2


def fix_version_menu_en(soup: BeautifulSoup, depth: int) -> None:
    """
    将英文页面的版本菜单从多语言列表简化为 "English" 纯文本 + "中文" 链接。
    利用 page-versions 的 data-en 属性构建中文页面的相对路径。
    """
    page_versions = soup.find("div", class_="page-versions")
    if not page_versions:
        return
    data_en = page_versions.get("data-en", "")
    if not data_en:
        return

    # 构建中文页面的相对链接
    # depth=1: ../zh/ + data_en + /
    # depth=2: ../../zh/ + data_en + /
    # depth=3: ../../../zh/ + data_en + /
    prefix = "../" * depth + "zh/"
    if data_en == "index":
        zh_href = prefix  # 根页面
    else:
        zh_href = prefix + data_en + "/"

    # 替换 version-menu 内容
    version_menu = soup.find("div", class_="version-menu")
    if not version_menu:
        return

    # 清空现有内容
    version_menu.clear()

    # 添加 "English" 纯文本（当前版本标识）
    en_span = soup.new_tag("span", attrs={"class": "version is-current"})
    en_span.append("English")
    version_menu.append(en_span)
    version_menu.append("\n       ")

    # 添加 "中文" 链接
    zh_a = soup.new_tag("a", attrs={"class": "version", "href": zh_href})
    zh_a.append("中文")
    version_menu.append(zh_a)

    # 同时更新 toggle 按钮文字为 "English"
    toggle_btn = soup.find("button", class_="version-menu-toggle")
    if toggle_btn:
        for child in list(toggle_btn.children):
            if isinstance(child, NavigableString):
                child.extract()
        toggle_btn.append("English")


def main():
    all_files = sorted(EN_DIR.rglob("index.htm"))
    print(f"Found {len(all_files)} EN pages to fix")

    fixed = 0
    errors = 0
    for i, f in enumerate(all_files, 1):
        try:
            content = f.read_text(encoding="utf-8")
            soup = BeautifulSoup(content, "html.parser")

            version_menu = soup.find("div", class_="version-menu")
            if not version_menu:
                continue

            depth = compute_depth(f)
            fix_version_menu_en(soup, depth)

            f.write_text(str(soup), encoding="utf-8")
            fixed += 1
        except Exception as e:
            errors += 1
            print(f"  ERROR: {f}: {e}")

        if i % 100 == 0:
            print(f"  Progress: {i}/{len(all_files)}")

    print(f"Done! Fixed: {fixed}, Errors: {errors}")


if __name__ == "__main__":
    main()
