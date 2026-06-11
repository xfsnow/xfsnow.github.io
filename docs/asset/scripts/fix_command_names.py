#!/usr/bin/env python3
"""
批量修复 zh/commands/*/index.htm 和 zh/tools/*/index.htm 中
<a class="xref page"> 链接文字被翻译成中文的问题。
使用 BeautifulSoup 解析，从 href 提取英文命令名还原链接文字。
"""
import os
import sys
import glob
from bs4 import BeautifulSoup, NavigableString

def fix_file(filepath):
    """修复单个文件，返回修复数量。"""
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    changes = 0
    for a in soup.find_all('a', class_='xref page', href=True):
        href = a.get('href', '')
        en_name = href.rstrip('/').split('/')[-1]
        if not en_name:
            continue
        current_text = a.get_text(strip=True)
        if current_text != en_name:
            # 替换链接内所有文字为英文命令名
            # 方法：清空内容，插入英文命令名
            a.clear()
            a.append(en_name)
            changes += 1

    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        return changes
    return 0


def main():
    base = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'manual', 'zh')
    base = os.path.normpath(base)

    total_changes = 0
    total_files = 0

    # 扫描 commands 目录
    cmd_pattern = os.path.join(base, 'commands', '*', 'index.htm')
    for filepath in sorted(glob.glob(cmd_pattern)):
        changes = fix_file(filepath)
        if changes > 0:
            total_files += 1
            total_changes += changes
            dirname = os.path.basename(os.path.dirname(filepath))
            print(f'  commands/{dirname}: {changes} names fixed')

    # 扫描 tools 目录
    tools_pattern = os.path.join(base, 'tools', '*', 'index.htm')
    for filepath in sorted(glob.glob(tools_pattern)):
        changes = fix_file(filepath)
        if changes > 0:
            total_files += 1
            total_changes += changes
            dirname = os.path.basename(os.path.dirname(filepath))
            print(f'  tools/{dirname}: {changes} names fixed')

    # 扫描根目录 index.htm（如 ToolsEN/index.htm, CommandsEN/index.htm）
    root_pattern = os.path.join(base, '*EN', 'index.htm')
    for filepath in sorted(glob.glob(root_pattern)):
        changes = fix_file(filepath)
        if changes > 0:
            total_files += 1
            total_changes += changes
            dirname = os.path.basename(os.path.dirname(filepath))
            print(f'  {dirname}/: {changes} names fixed')

    print(f'\nTotal: {total_files} files, {total_changes} command names restored to English')


if __name__ == '__main__':
    main()
