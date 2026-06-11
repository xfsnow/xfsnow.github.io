"""
fix_links.py — 将 zh/ 目录下 HTML 文件中的 /docs/manual/en/ 导航链接批量替换为 /docs/manual/zh/

规则：
- href="/docs/manual/en/..." 且不在 class="version" 的 <a> 标签上 → 改为 /docs/manual/zh/...
- tppabs="https://geogebra.github.io/docs/manual/en/..." 同步改为 zh
- class="version" 或 class="version is-current" 的链接：保留 en（这是切换到英文版的入口）

用法：
    python fix_links.py <zh_dir>          # 处理整个 zh 目录
    python fix_links.py <zh_file>         # 处理单个文件
"""

import sys
import re
from pathlib import Path

try:
    from bs4 import BeautifulSoup, NavigableString, Tag
except ImportError:
    print("请先安装 BeautifulSoup4：pip install beautifulsoup4")
    sys.exit(1)


EN_PREFIX = "/docs/manual/en/"
ZH_PREFIX = "/docs/manual/zh/"
TPPABS_EN = "https://geogebra.github.io/docs/manual/en/"
TPPABS_ZH = "https://geogebra.github.io/docs/manual/zh/"


def is_version_link(tag: Tag) -> bool:
    """判断是否为版本切换链接（应保留 en 路径）"""
    classes = tag.get("class", [])
    if isinstance(classes, str):
        classes = classes.split()
    return "version" in classes


def fix_file(filepath: Path) -> int:
    """处理单个文件，返回替换次数"""
    content = filepath.read_text(encoding="utf-8")

    # 快速检查：文件中是否有需要处理的内容
    if EN_PREFIX not in content and TPPABS_EN not in content:
        return 0

    soup = BeautifulSoup(content, "html.parser")
    changed = 0

    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        tppabs = a.get("tppabs", "")

        # 版本切换链接保留 en
        if is_version_link(a):
            continue

        # 修改 href
        if href.startswith(EN_PREFIX):
            a["href"] = ZH_PREFIX + href[len(EN_PREFIX):]
            changed += 1

        # 同步修改 tppabs
        if tppabs.startswith(TPPABS_EN):
            a["tppabs"] = TPPABS_ZH + tppabs[len(TPPABS_EN):]

    if changed > 0:
        filepath.write_text(soup.prettify(), encoding="utf-8")

    return changed


def process(path_str: str):
    path = Path(path_str)

    if path.is_file():
        n = fix_file(path)
        print(f"  {path.name}: {n} 处链接已修正")
        return

    if not path.is_dir():
        print(f"错误：路径不存在：{path}")
        sys.exit(1)

    htm_files = sorted(path.rglob("*.htm"))
    total_files = 0
    total_changes = 0

    for f in htm_files:
        n = fix_file(f)
        if n > 0:
            total_files += 1
            total_changes += n
            print(f"  [{total_files}] {f.relative_to(path)}: {n} 处")

    print(f"\n完成：{total_files} 个文件，共修正 {total_changes} 处链接（跳过 {len(htm_files) - total_files} 个无变化文件）")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法：python fix_links.py <zh_dir_or_file>")
        sys.exit(1)
    process(sys.argv[1])
