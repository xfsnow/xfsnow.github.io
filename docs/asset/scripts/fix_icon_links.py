#!/usr/bin/env python3
"""
修复中文翻译目录页中丢失的图标链接。

英文原页中，目录页的每个命令条目包含：
  <a class="xref page" href="..."><span class="image"><img src="..."></span></a>  ← 图标链接
  <a class="xref page" href="...">Move</a>                                       ← 文字链接

翻译时 fix_command_link_text() 的 a.clear() 错误地把图标链接中的
<span class="image"><img></span> 清掉了，导致：
1. 图标丢失
2. 图标链接变成纯文字链接，和后面的文字链接重复

本脚本从英文原文恢复图标链接，并删除因 clear() 产生的重复文字链接。
"""
import os
import sys
import glob
from bs4 import BeautifulSoup, NavigableString, Tag

# 受影响的页面
AFFECTED_PAGES = [
    "tools/3D_Graphics_Tools",
    "tools/CAS_Tools",
    "tools/Spreadsheet_Tools",
    "tools/Translate_by_Vector",
]


def fix_page(en_base, zh_base, page_rel):
    """修复单个目录页"""
    en_path = os.path.join(en_base, page_rel, "index.htm")
    zh_path = os.path.join(zh_base, page_rel, "index.htm")

    if not os.path.exists(en_path) or not os.path.exists(zh_path):
        print(f"  SKIP {page_rel}: file not found")
        return 0

    with open(en_path, "r", encoding="utf-8") as f:
        en_soup = BeautifulSoup(f.read(), "html.parser")
    with open(zh_path, "r", encoding="utf-8") as f:
        zh_soup = BeautifulSoup(f.read(), "html.parser")

    en_article = en_soup.find("article", class_="doc")
    zh_article = zh_soup.find("article", class_="doc")
    if not en_article or not zh_article:
        print(f"  SKIP {page_rel}: no article")
        return 0

    # 收集英文原文中的图标链接信息
    # key: (href 最后一段, img alt), value: 图标链接的 HTML
    # 注意：同一命令可能有多条图标链接（如 Move 出现在 Movement Tools 和 Line Tools 中，
    # 但图标不同：Mode move.svg vs Mode segmentfixed.svg），需要用 alt 区分
    en_icon_links = {}  # keyed by index order
    for a in en_article.find_all("a", class_="xref page", href=True):
        if a.find("img"):
            en_icon_links[len(en_icon_links)] = a

    if not en_icon_links:
        print(f"  SKIP {page_rel}: no icon links in EN")
        return 0

    # 构建 EN 中图标链接的文字链接对应关系
    # 每个 <p> 中通常有 1 个图标链接 + 1 个文字链接，按 <p> 分组
    en_pairs = []  # [(icon_link, text_link_href_cmd)]
    en_all_links = en_article.find_all("a", class_="xref page", href=True)
    for i, a in enumerate(en_all_links):
        if a.find("img"):
            # 找同 <p> 中的文字链接
            parent_p = a.find_parent("p")
            if parent_p:
                siblings = parent_p.find_all("a", class_="xref page", href=True)
                for sib in siblings:
                    if not sib.find("img"):
                        text_cmd = sib.get("href", "").rstrip("/").split("/")[-1]
                        en_pairs.append((a, text_cmd))
                        break

    changes = 0
    zh_article_links = zh_article.find_all("a", class_="xref page", href=True)

    # 遍历 ZH 中的所有 xref page 文字链接
    # 策略：对于每个文字链接，检查同 <p> 中是否已有图标链接
    # 如果缺少，从 EN 的对应 pair 中复制图标链接插入到文字链接前面
    for a in list(zh_article.find_all("a", class_="xref page", href=True)):
        if a.find("img"):
            continue  # 跳过已有图标的链接

        href = a.get("href", "")
        cmd_name = href.rstrip("/").split("/")[-1]

        # 检查同 <p> 中是否已有同命令的图标链接
        parent_p = a.find_parent("p")
        if parent_p:
            existing_icons = parent_p.find_all("a", class_="xref page", href=True)
            has_icon = any(
                x.find("img") and x.get("href", "").rstrip("/").split("/")[-1] == cmd_name
                for x in existing_icons
            )
            if has_icon:
                continue  # 已有图标，跳过

        # 找 EN 中同命令同 <p> 的图标链接
        # 需要匹配命令名
        en_icon_match = None
        for icon_a, text_cmd in en_pairs:
            if text_cmd == cmd_name:
                # 进一步检查：图标链接所在 <p> 中的文字链接和当前 ZH 文字链接是否对应
                en_icon_match = icon_a
                break

        if not en_icon_match:
            continue

        # 需要恢复图标链接
        # 从 EN 复制图标链接，修改 href 和 tppabs 指向 zh
        new_icon = BeautifulSoup(str(en_icon_match), "html.parser").find("a")

        # 修改 href: en → zh
        new_href = new_icon.get("href", "")
        new_href = new_href.replace("/docs/manual/en/", "/docs/manual/zh/")
        new_icon["href"] = new_href

        # 修改 tppabs: en → zh
        if new_icon.get("tppabs"):
            new_tppabs = new_icon["tppabs"].replace("/docs/manual/en/", "/docs/manual/zh/")
            new_icon["tppabs"] = new_tppabs

        # 修改 img src: 保持相对路径不变（../../_images/ 对 depth=3 页面正确）
        # tppabs 中的 en → zh
        for img in new_icon.find_all("img"):
            if img.get("tppabs"):
                img["tppabs"] = img["tppabs"].replace("/docs/manual/en/", "/docs/manual/zh/")

        # 插入到文字链接前面
        a.insert_before(new_icon)
        # 添加空格分隔
        a.insert_before(NavigableString(" "))
        changes += 1

    if changes > 0:
        with open(zh_path, "w", encoding="utf-8") as f:
            f.write(str(zh_soup))

    return changes


def remove_duplicate_text_links(zh_base):
    """
    删除重复的文字链接。
    图标链接被 clear() 后变成纯文字链接，和后面的文字链接重复。
    模式：<a>Command</a> <a>Command</a>（同 href，同文字，第一个是误转的图标链接）
    """
    total_removed = 0
    
    for page_rel in AFFECTED_PAGES:
        zh_path = os.path.join(zh_base, page_rel, "index.htm")
        if not os.path.exists(zh_path):
            continue

        with open(zh_path, "r", encoding="utf-8") as f:
            zh_soup = BeautifulSoup(f.read(), "html.parser")

        zh_article = zh_soup.find("article", class_="doc")
        if not zh_article:
            continue

        links = zh_article.find_all("a", class_="xref page", href=True)
        removed = 0

        # 找重复：相邻两个 <a> 同 href 同文字
        i = 0
        while i < len(links) - 1:
            a1 = links[i]
            a2 = links[i + 1]
            href1 = a1.get("href", "").rstrip("/")
            href2 = a2.get("href", "").rstrip("/")
            text1 = a1.get_text(strip=True)
            text2 = a2.get_text(strip=True)

            if href1 == href2 and text1 == text2:
                # 第一个没有图标的是重复链接，删除
                if not a1.find("img"):
                    a1.decompose()
                    removed += 1
                    # 重新获取链接列表
                    links = zh_article.find_all("a", class_="xref page", href=True)
                    continue
            i += 1

        if removed > 0:
            with open(zh_path, "w", encoding="utf-8") as f:
                f.write(str(zh_soup))

        total_removed += removed
        print(f"  {page_rel}: removed {removed} duplicate text links")

    return total_removed


def main():
    en_base = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "manual", "en"))
    zh_base = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "manual", "zh"))

    # Step 1: 恢复图标链接
    print("Step 1: Restoring icon links from EN original...")
    total_icons = 0
    for page_rel in AFFECTED_PAGES:
        changes = fix_page(en_base, zh_base, page_rel)
        total_icons += changes
        print(f"  {page_rel}: {changes} icon links restored")
    print(f"  Total: {total_icons} icon links restored\n")

    # Step 2: 删除重复文字链接
    print("Step 2: Removing duplicate text links...")
    total_dups = remove_duplicate_text_links(zh_base)
    print(f"  Total: {total_dups} duplicate links removed\n")

    print("Done!")


if __name__ == "__main__":
    main()
