"""
translate_html.py  —  GeoGebra 文档汉化脚本
用法：
    python translate_html.py <en_file> <zh_file> [--api-key KEY] [--api {gemini|glm|qwen}]

    en_file : en 目录下的源 HTML 文件路径
    zh_file : zh 目录下的目标 HTML 文件路径（自动创建目录）
    --api-key : GLM API Key（也可通过环境变量 GLM_API_KEY 设置）
    --api    : API 后端（gemini=本地Gemini代理，qwen=阿里千问，glm=智谱GLM，默认 gemini）

批量用法（翻译整个目录）：
    python translate_html.py --batch en_dir zh_dir [--api-key KEY] [--api {gemini|glm|qwen}]

环境变量：
    GEMINI_API_KEY  — Gemini 代理 API Key（本地代理可能不需要）
    GEMINI_BASE_URL — Gemini 代理地址（默认 http://localhost:8081/v1）
    QWEN_API_KEY    — 阿里千问 API Key（使用 qwen 时必须设置）
    QWEN_BASE_URL   — 千问 API 地址（默认 https://dashscope.aliyuncs.com/compatible-mode/v1）
    QWEN_MODEL      — 千问模型名（默认 qwen3.7-max）
    GLM_API_KEY     — 智谱 GLM API Key（使用 glm 时必须设置）

断点续传：已存在的 zh_file 自动跳过。
"""

import os
import sys
import re
import time
import argparse
import http.client
import json
import urllib.parse
from pathlib import Path

try:
    from bs4 import BeautifulSoup, NavigableString, Comment, Tag, Doctype
except ImportError:
    print("请先安装 BeautifulSoup4：pip install beautifulsoup4")
    sys.exit(1)

# ─────────────────────── 术语表（从 terminology.md 动态加载）───────────────────────

def find_terminology_file() -> str:
    """自动查找 terminology.md 路径"""
    # 相对于脚本位置的默认路径
    script_dir = Path(__file__).resolve().parent
    candidates = [
        script_dir.parent.parent / "manual" / "zh" / "terminology.md",
        script_dir / "terminology.md",
    ]
    for p in candidates:
        if p.exists():
            return str(p)
    return ""


def load_terminology(filepath: str = "") -> dict[str, str]:
    """
    从 terminology.md 解析所有表格，返回 {英文: 中文} 字典。
    表格格式：| 英文 | 中文 |
    跳过包含注释/说明的行（如括号内注释、管道符号等）。
    """
    if not filepath:
        filepath = find_terminology_file()
    if not filepath or not Path(filepath).exists():
        print(f"  [警告] 未找到 terminology.md，术语表为空")
        return {}

    terminology = {}
    in_table = False

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            # 跳过标题行和分隔行
            if line.startswith("| ---") or line.startswith("|---"):
                in_table = True
                continue
            if line.startswith("#") or not line:
                in_table = False
                continue
            if not line.startswith("|"):
                continue
            # 解析表格行
            cells = [c.strip() for c in line.strip("|").split("|")]
            if len(cells) >= 2 and cells[0] and cells[1]:
                en = cells[0].strip()
                zh = cells[1].strip()
                # 跳过表头行
                if en in ("英文", "English"):
                    continue
                # 跳过注释说明行（如 "Version / English" 这种复杂描述）
                if "/" in en or "(" in en or "（" in zh or "：" in zh:
                    continue
                # 跳过值中包含代码块的行
                if "`" in en:
                    continue
                terminology[en] = zh

    print(f"  术语表：从 {filepath} 加载 {len(terminology)} 条术语")
    return terminology


def build_system_prompt(terminology: dict[str, str]) -> str:
    """根据术语表动态构建 system prompt"""
    # 只取较短的术语放入 prompt（避免太长）
    short_terms = {k: v for k, v in terminology.items() if len(k) <= 40}
    term_lines = " | ".join(f"{k}={v}" for k, v in sorted(short_terms.items()))

    return f"""你是 GeoGebra 官方文档专业翻译员，负责将英文文档翻译成简体中文。每条文本都必须翻译，不得保留英文原文。

规则（严格遵守）：
1. 只输出翻译结果，不加任何解释或前缀。每条都必须翻译成中文。
2. 仅以下内容保留英文：GeoGebra、CAS；首字母大写的 GeoGebra 命令名（如 Circle、Rotate、Intersect、Derivative、Length、Curvature、CurvatureVector、OsculatingCircle、FitPoly、ImplicitCurve 等）；命令示例中的代码（如 y = 2x + 3）；LaTeX/MathJax 公式符号。
3. 数学概念词（如 parameter、curve、point、function、expression、slider、syntax）在描述性句子中必须翻译为中文（参数、曲线、点、函数、表达式、滑动条、语法）。只有在作为命令名（首字母大写且属于 GeoGebra 命令）时才保留英文。
4. 专有名词 GeoGebra、CAS 保留英文，其余全部翻译。
5. 保留文本中的空格结构（前导/尾随空格）。
6. 标题（h1、h2 等）中的英文必须翻译。

术语对照（优先使用）：
{term_lines}"""


# 延迟初始化，由 main() 加载
TERMINOLOGY: dict[str, str] = {}
SYSTEM_PROMPT: str = ""

# 绝不翻译的节点选择器（CSS 类或标签）
SKIP_TAGS = {"script", "style", "code", "pre", "svg", "math"}
SKIP_CLASSES = {"kcode", "hljs", "listingblock", "literalblock", "hdlist1"}

# ─────────────────────── 图片路径处理 ───────────────────────

def fix_image_paths(soup: BeautifulSoup, depth: int) -> None:
    """
    zh 文件中的图片要指向 en/_images/。
    depth=2 表示文件在 zh/Foo/index.htm（距 manual 根 2 级），
    depth=3 表示文件在 zh/commands/Foo/index.htm（距 manual 根 3 级）。
    en/_images 在 manual/en/_images，所以相对路径为 depth×"../" + "en/_images/"。
    """
    prefix = "../" * depth + "en/_images/"
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "_images/" in src:
            # 取文件名
            fname = src.split("_images/")[-1]
            img["src"] = prefix + fname


def fix_nav_links(soup: BeautifulSoup) -> int:
    """
    将导航链接中的 /docs/manual/en/ 替换为 /docs/manual/zh/。
    class="version" 或 class="version is-current" 的链接保留 en（切换到英文版的入口）。
    返回替换次数。
    """
    EN_PREFIX = "/docs/manual/en/"
    ZH_PREFIX = "/docs/manual/zh/"
    TPPABS_EN = "https://geogebra.github.io/docs/manual/en/"
    TPPABS_ZH = "https://geogebra.github.io/docs/manual/zh/"
    changed = 0

    for a in soup.find_all("a", href=True):
        classes = a.get("class", [])
        if isinstance(classes, str):
            classes = classes.split()
        # version 类链接保留 en
        if "version" in classes:
            continue
        href = a.get("href", "")
        tppabs = a.get("tppabs", "")
        if href.startswith(EN_PREFIX):
            a["href"] = ZH_PREFIX + href[len(EN_PREFIX):]
            changed += 1
        if tppabs.startswith(TPPABS_EN):
            a["tppabs"] = TPPABS_ZH + tppabs[len(TPPABS_EN):]
    return changed


def fix_version_menu(soup: BeautifulSoup, depth: int) -> None:
    """
    将版本菜单从多语言列表简化为 "中文" 纯文本 + "English" 链接。
    利用 page-versions 的 data-en 属性构建英文页面相对路径。
    """
    # 获取 data-en 属性（英文页面路径，相对于 en/ 根）
    page_versions = soup.find("div", class_="page-versions")
    if not page_versions:
        return
    data_en = page_versions.get("data-en", "")
    if not data_en:
        return

    # 构建英文页面的相对链接
    # depth=2: ../../en/ + data_en + /
    # depth=3: ../../../en/ + data_en + /
    prefix = "../" * depth + "en/"
    if data_en == "index":
        en_href = prefix  # 根页面
    else:
        en_href = prefix + data_en + "/"

    # 替换 version-menu 内容
    version_menu = soup.find("div", class_="version-menu")
    if not version_menu:
        return

    # 清空现有内容
    version_menu.clear()

    # 添加 "中文" 纯文本（当前版本标识）
    zh_span = soup.new_tag("span", attrs={"class": "version is-current"})
    zh_span.append("中文")
    version_menu.append(zh_span)
    version_menu.append("\n       ")

    # 添加 "English" 链接
    en_a = soup.new_tag("a", attrs={"class": "version", "href": en_href})
    en_a.append("English")
    version_menu.append(en_a)

    # 同时更新 toggle 按钮文字为 "中文"
    toggle_btn = soup.find("button", class_="version-menu-toggle")
    if toggle_btn:
        for child in list(toggle_btn.children):
            if isinstance(child, NavigableString):
                child.extract()
        toggle_btn.append("中文")


def fix_command_link_text(soup: BeautifulSoup) -> int:
    """
    目录页中的 <a class="xref page"> 链接文字应保持英文命令名，
    不翻译为中文。从 href 路径提取英文命令名来还原。
    注意：跳过包含 <img> 子节点的图标链接，避免 a.clear() 删掉图标。
    返回修正次数。
    """
    changed = 0
    for a in soup.find_all("a", class_="xref page", href=True):
        # 跳过包含图标的链接（图标链接不需要改文字，且 clear() 会删图标）
        if a.find("img"):
            continue
        href = a.get("href", "")
        # 从 href 提取英文命令名（最后一个路径段）
        en_name = href.rstrip("/").split("/")[-1]
        if not en_name:
            continue
        # 获取链接文字（去除空白）
        current_text = a.get_text(strip=True)
        if current_text != en_name:
            # 替换链接内所有文字为英文命令名
            a.clear()
            a.append(en_name)
            changed += 1
    return changed


# ─────────────────────── 文本节点判断 ───────────────────────

def should_skip_node(node) -> bool:
    """判断此节点是否应该跳过翻译（代码、纯空白、数字、Doctype 等）"""
    if isinstance(node, (Comment, Doctype)):
        return True
    if not isinstance(node, NavigableString):
        return True
    text = str(node)
    if not text.strip():
        return True
    # 纯数字/符号
    if re.fullmatch(r'[\d\s\.\,\:\;\-\+\=\/\(\)\[\]\{\}|©®™…°²³]+', text.strip()):
        return True
    # 已经全是中文
    if all('\u4e00' <= c <= '\u9fff' or not c.isalpha() for c in text.strip()):
        return True
    # GeoGebra 命令调用语法：CommandName( <Arg> ) 形式，保留英文
    # 匹配如 "Angle( <Object> )"、"Rotate( <Point>, <Angle>, <Apex> )" 等
    if re.search(r'\b[A-Z][A-Za-z]+\s*\(', text.strip()) and ('<' in text or '&lt;' in text):
        return True
    # 智能判断 <em> 中的内容：如果是单个字符、纯数学变量/表达式则跳过
    parent = node.parent
    if parent and isinstance(parent, Tag) and parent.name == "em":
        stripped = text.strip()
        # 单个字母/符号（如 x, y, a, α, π）
        if re.fullmatch(r'[a-zA-Zα-ωΑ-ΩπΔ∑∫∂√±∞≈≠≤≥²³°]', stripped):
            return True
        # 纯数学表达式（数字+运算符+字母+°²³，如 45°, 1.57, x², 90°）
        if re.fullmatch(r'[\d\.\,\-\+\=\/\(\)\[\]\{\}a-zA-Zα-ωΑ-ΩπΔ°²³\s]+', stripped) and not re.search(r'[A-Za-z]{2,}', stripped):
            return True
        # <em> 中的命令语法（如 "Rotate( <Point>, <Angle>, <Apex> )"）
        if re.search(r'\b[A-Z][A-Za-z]+\s*\(', stripped) and ('<' in stripped or '&lt;' in stripped):
            return True
    return False


def should_skip_parent(node) -> bool:
    """检查父级元素是否属于跳过列表"""
    for parent in node.parents:
        if not isinstance(parent, Tag):
            break
        if parent.name in SKIP_TAGS:
            return True
        parent_classes = set(parent.get("class", []))
        if parent_classes & SKIP_CLASSES:
            return True
        # aria-label / placeholder / title 等属性中文本不通过此路径处理
    return False


def collect_text_nodes(soup: BeautifulSoup):
    """收集所有需要翻译的文本节点，返回 (node, original_text) 列表"""
    nodes = []
    for node in soup.find_all(string=True):
        if should_skip_node(node):
            continue
        if should_skip_parent(node):
            continue
        nodes.append((node, str(node)))
    return nodes


def collect_translatable_attrs(soup: BeautifulSoup):
    """收集 placeholder / title / aria-label / data-title 等属性中的可翻译文本"""
    items = []
    for tag in soup.find_all(True):
        for attr in ("placeholder", "aria-label", "data-title"):
            val = tag.get(attr, "")
            if val and not all('\u4e00' <= c <= '\u9fff' or not c.isalpha() for c in val):
                items.append((tag, attr, val))
    return items

# ─────────────────────── 术语表快速替换 ───────────────────────

def apply_terminology(text: str) -> tuple[str, bool]:
    """
    尝试用术语表直接替换整个文本节点。
    返回 (translated_text, was_replaced)。
    只有文本严格等于术语表键才替换（去掉首尾空格后比较）。
    """
    stripped = text.strip()
    if stripped in TERMINOLOGY:
        return text.replace(stripped, TERMINOLOGY[stripped], 1), True
    return text, False

# ─────────────────────── API 配置 ───────────────────────

# 本地 Gemini 代理配置
GEMINI_CONFIG = {
    "base_url": os.environ.get("GEMINI_BASE_URL", "http://localhost:8081/v1"),
    "api_key": os.environ.get("GEMINI_API_KEY", ""),
    "models": [
        "gemini-3.5-flash",
        "gemini-3.5-flash-thinking",
        "gemini-3.1-pro",
        "gemini-auto",
        "gemini-3.5-flash-thinking-lite",
        "gemini-flash-lite",
    ],
}

# 阿里千问 API 配置
QWEN_CONFIG = {
    "base_url": os.environ.get("QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1"),
    "api_key": os.environ.get("QWEN_API_KEY", ""),
    "model": os.environ.get("QWEN_MODEL", "qwen3.7-max"),
}

# ─────────────────────── GLM API 调用 ───────────────────────


def call_glm_translate(texts: list[str], api_key: str, model: str = "glm-4-flash") -> list[str]:
    """
    智谱 GLM API 批量翻译。
    """
    if not texts:
        return []

    numbered = "\n".join(f"[{i+1}] {t}" for i, t in enumerate(texts))
    user_msg = f"请将以下每条文本翻译成中文（保留编号格式输出）：\n{numbered}"

    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg}
        ],
        "temperature": 0.1,
        "max_tokens": 4096,
    })

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    try:
        conn = http.client.HTTPSConnection("open.bigmodel.cn", timeout=60)
        conn.request("POST", "/api/paas/v4/chat/completions", payload, headers)
        resp = conn.getresponse()
        body = resp.read().decode("utf-8")
        conn.close()

        data = json.loads(body)
        if "choices" not in data:
            print(f"  [GLM错误] {body[:200]}")
            return texts

        content = data["choices"][0]["message"]["content"].strip()
        return parse_numbered_response(content, texts)

    except Exception as e:
        print(f"  [GLM调用失败] {e}")
        return texts


def call_gemini_translate(texts: list[str], model: str = None) -> list[str]:
    """
    本地 Gemini 代理翻译（OpenAI 兼容格式）。
    支持模型回退：如果指定模型失败，依次尝试后续模型。
    """
    if not texts:
        return []

    models = [model] if model else GEMINI_CONFIG["models"]

    numbered = "\n".join(f"[{i+1}] {t}" for i, t in enumerate(texts))
    user_msg = f"请将以下每条文本翻译成中文（保留编号格式输出）：\n{numbered}"

    base_url = GEMINI_CONFIG["base_url"].rstrip("/")

    for m in models:
        try:
            payload = json.dumps({
                "model": m,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_msg}
                ],
                "temperature": 0.1,
                "max_tokens": 4096,
            })

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GEMINI_CONFIG['api_key']}",
            }

            # 解析 base_url 得到 host 和 path
            parsed = urllib.parse.urlparse(base_url)
            host = parsed.hostname
            port = parsed.port or 80
            path = parsed.path.rstrip("/") + "/chat/completions"

            conn = http.client.HTTPConnection(host, port, timeout=60)
            conn.request("POST", path, payload, headers)
            resp = conn.getresponse()
            body = resp.read().decode("utf-8")
            conn.close()

            if resp.status != 200:
                print(f"  [Gemini:{m}] HTTP {resp.status}，尝试下一个模型...")
                time.sleep(1)
                continue

            data = json.loads(body)
            if "choices" not in data:
                print(f"  [Gemini:{m}] 响应异常：{body[:200]}，尝试下一个模型...")
                time.sleep(1)
                continue

            content = data["choices"][0]["message"]["content"].strip()
            print(f"  [Gemini:{m}] 成功")
            return parse_numbered_response(content, texts)

        except (ConnectionRefusedError, http.client.HTTPException, OSError) as e:
            print(f"  [Gemini:{m}] 连接失败：{e}，尝试下一个模型...")
            time.sleep(2)
            continue
        except Exception as e:
            print(f"  [Gemini:{m}] 调用失败：{e}，尝试下一个模型...")
            time.sleep(1)
            continue

    print("  [Gemini] 所有模型均失败，返回原文")
    return texts


def call_qwen_translate(texts: list[str], model: str = None) -> list[str]:
    """
    阿里千问 API 翻译（OpenAI 兼容格式）。
    """
    if not texts:
        return []

    m = model or QWEN_CONFIG["model"]

    numbered = "\n".join(f"[{i+1}] {t}" for i, t in enumerate(texts))
    user_msg = f"请将以下每条文本翻译成中文（保留编号格式输出）：\n{numbered}"

    payload = json.dumps({
        "model": m,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg}
        ],
        "temperature": 0.1,
        "max_tokens": 4096,
    })

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {QWEN_CONFIG['api_key']}",
    }

    try:
        base_url = QWEN_CONFIG["base_url"].rstrip("/")
        parsed = urllib.parse.urlparse(base_url)
        host = parsed.hostname
        port = parsed.port or 443
        path = parsed.path.rstrip("/") + "/chat/completions"

        use_https = parsed.scheme == "https"

        for attempt in range(3):
            try:
                if use_https:
                    conn = http.client.HTTPSConnection(host, port, timeout=180)
                else:
                    conn = http.client.HTTPConnection(host, port, timeout=180)

                conn.request("POST", path, payload, headers)
                resp = conn.getresponse()
                body = resp.read().decode("utf-8")
                conn.close()
                break
            except Exception as conn_err:
                if attempt < 2:
                    print(f"  [Qwen:{m}] 连接失败（第{attempt+1}次），重试...")
                    time.sleep(2)
                else:
                    raise conn_err

        if resp.status != 200:
            print(f"  [Qwen:{m}] HTTP {resp.status}：{body[:200]}")
            return texts

        data = json.loads(body)
        if "choices" not in data:
            print(f"  [Qwen:{m}] 响应异常：{body[:200]}")
            return texts

        content = data["choices"][0]["message"]["content"].strip()
        # Qwen3 可能在回复中包含 <think/> 推理块，需要去掉
        content = re.sub(r'<think[\s\S]*?</think\s*>', '', content).strip()
        print(f"  [Qwen:{m}] 成功")
        return parse_numbered_response(content, texts)

    except Exception as e:
        print(f"  [Qwen:{m}] 调用失败：{e}")
        return texts


def parse_numbered_response(content: str, originals: list[str]) -> list[str]:
    """
    解析 [1] xxx [2] yyy 格式的批量翻译响应。
    失败条目保留原文。
    """
    results = [""] * len(originals)
    lines = content.splitlines()
    current_idx = None
    current_lines = []

    for line in lines:
        m = re.match(r"^\[(\d+)\]\s*(.*)", line)
        if m:
            if current_idx is not None and 1 <= current_idx <= len(originals):
                results[current_idx - 1] = "\n".join(current_lines).strip()
            current_idx = int(m.group(1))
            current_lines = [m.group(2)]
        else:
            if current_idx is not None:
                current_lines.append(line)

    if current_idx is not None and 1 <= current_idx <= len(originals):
        results[current_idx - 1] = "\n".join(current_lines).strip()

    for i, r in enumerate(results):
        if not r:
            results[i] = originals[i]

    return results


def preserve_whitespace(original: str, translated: str) -> str:
    """保留原文的前导/尾随空白"""
    leading = len(original) - len(original.lstrip())
    trailing = len(original) - len(original.rstrip())
    prefix = original[:leading]
    suffix = original[len(original)-trailing:] if trailing else ""
    return prefix + translated.strip() + suffix

# ─────────────────────── 主翻译逻辑 ───────────────────────

def translate_file(en_path: str, zh_path: str, api_key: str = "", api: str = "gemini", depth: int = None, model: str = "") -> bool:
    """
    翻译单个 HTML 文件。
    api: "gemini"（本地Gemini代理）或 "glm"（智谱GLM）或 "qwen"（阿里千问）
    depth: zh 文件相对 manual/ 根目录的层数（用于图片路径计算）。
           None 表示自动计算。
    返回 True 表示成功。
    """
    en_path = Path(en_path)
    zh_path = Path(zh_path)

    if not en_path.exists():
        print(f"  [错误] 源文件不存在：{en_path}")
        return False

    # 自动计算 depth
    if depth is None:
        # 计算 zh_path 距离 manual 目录的层数
        parts = zh_path.parts
        try:
            zh_idx = next(i for i, p in enumerate(parts) if p == "zh")
            # zh/Foo/index.htm -> depth=2, zh/commands/Foo/index.htm -> depth=3
            depth = len(parts) - zh_idx - 1  # 减去文件名
        except StopIteration:
            depth = 2  # 默认

    # 读取源文件
    with open(en_path, "r", encoding="utf-8") as f:
        content = f.read()

    soup = BeautifulSoup(content, "html.parser")

    # 1. 修改 lang 属性
    html_tag = soup.find("html")
    if html_tag:
        html_tag["lang"] = "zh-CN"

    # 2. 简化版本菜单：将多语言列表替换为 "中文" + "English" 链接
    fix_version_menu(soup, depth)

    # 2b. 翻译 explore 面板中的版本标签
    for tag in soup.find_all("span", class_="version"):
        for child in tag.children:
            if isinstance(child, NavigableString) and child.strip() in ("English", "英语"):
                child.replace_with("中文")

    # 2c. 翻译 CSS 中的 Note → 注意
    for style_tag in soup.find_all("style"):
        if style_tag.string and 'content: "Note"' in style_tag.string:
            style_tag.string = style_tag.string.replace('content: "Note"', 'content: "注意"')

    # 3. 修复图片路径
    fix_image_paths(soup, depth)

    # 3b. 将导航链接中的 /docs/manual/en/ 替换为 /docs/manual/zh/
    #     version 类链接（切换到英文版）保留 en 路径
    fix_nav_links(soup)

    # 4. 收集所有需要翻译的文本节点
    text_nodes = collect_text_nodes(soup)
    attr_items = collect_translatable_attrs(soup)

    print(f"  找到 {len(text_nodes)} 个文本节点，{len(attr_items)} 个属性需要翻译")

    # 4. 先用术语表做快速替换，剩余的送 AI 翻译
    need_ai_nodes = []  # (node, original)
    need_ai_attrs = []  # (tag, attr, original)

    for node, orig in text_nodes:
        translated, replaced = apply_terminology(orig)
        if replaced:
            node.replace_with(translated)
        else:
            need_ai_nodes.append((node, orig))

    for tag, attr, orig in attr_items:
        translated, replaced = apply_terminology(orig)
        if replaced:
            tag[attr] = translated
        else:
            need_ai_attrs.append((tag, attr, orig))

    print(f"  术语表命中：{len(text_nodes) - len(need_ai_nodes)} 节点 / {len(attr_items) - len(need_ai_attrs)} 属性")
    print(f"  需要 AI 翻译：{len(need_ai_nodes)} 节点 / {len(need_ai_attrs)} 属性")

    # 5. AI 批量翻译（每批最多 30 条）
    BATCH_SIZE = 30

    def do_translate(texts_batch):
        """根据 api 后端选择翻译函数"""
        if api == "gemini":
            return call_gemini_translate(texts_batch)
        elif api == "qwen":
            return call_qwen_translate(texts_batch, model=model or None)
        else:
            return call_glm_translate(texts_batch, api_key)

    def batch_translate_list(items_with_text):
        """items_with_text: list of (anything, original_text)"""
        texts = [orig for _, orig in items_with_text]
        results = []
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i:i + BATCH_SIZE]
            print(f"    翻译第 {i+1}-{i+len(batch)} 条...")
            for attempt in range(3):
                translated = do_translate(batch)
                # 检查是否有有效翻译（不是原样返回）
                if translated != batch or len(batch) <= 1:
                    results.extend(translated)
                    break
                if attempt < 2:
                    print(f"    第{attempt+1}次翻译返回原文，重试...")
                    time.sleep(3)
            else:
                results.extend(translated)
            if i + BATCH_SIZE < len(texts):
                time.sleep(1)  # 避免频率限制
        return results

    if need_ai_nodes:
        translated_texts = batch_translate_list(need_ai_nodes)
        for (node, orig), translated in zip(need_ai_nodes, translated_texts):
            final = preserve_whitespace(orig, translated)
            node.replace_with(final)

    if need_ai_attrs:
        translated_attrs = batch_translate_list([(None, orig) for _, _, orig in need_ai_attrs])
        for (tag, attr, orig), translated in zip(need_ai_attrs, translated_attrs):
            tag[attr] = preserve_whitespace(orig, translated)

    # 5b. 目录页中命令名链接文字保持英文（不翻译为中文）
    #     必须在 AI 翻译之后执行，因为翻译会把命令名翻译成中文
    fix_command_link_text(soup)

    # 6. 写出结果
    zh_path.parent.mkdir(parents=True, exist_ok=True)
    # BeautifulSoup 的 str(soup) 可能丢失 DOCTYPE，用 prettify 确保输出完整
    output = soup.prettify()
    with open(zh_path, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"  已写入：{zh_path}")
    return True


# ─────────────────────── 批量模式 ───────────────────────

def batch_translate(en_dir: str, zh_dir: str, api_key: str = "", api: str = "gemini", model: str = ""):
    en_dir = Path(en_dir)
    zh_dir = Path(zh_dir)

    htm_files = sorted(en_dir.rglob("*.htm"))
    print(f"共发现 {len(htm_files)} 个 HTML 文件")
    if api == "gemini":
        print(f"使用本地 Gemini 代理：{GEMINI_CONFIG['base_url']}")
    elif api == "qwen":
        print(f"使用阿里千问 API：{QWEN_CONFIG['base_url']}，模型：{model or QWEN_CONFIG['model']}")
    else:
        print(f"使用智谱 GLM API")

    done = 0
    skipped = 0
    failed = 0

    for en_path in htm_files:
        rel = en_path.relative_to(en_dir)
        zh_path = zh_dir / rel

        if zh_path.exists():
            skipped += 1
            continue

        print(f"\n[{done+1}/{len(htm_files)-skipped}] {rel}")
        ok = translate_file(str(en_path), str(zh_path), api_key=api_key, api=api, model=model)
        if ok:
            done += 1
        else:
            failed += 1

        time.sleep(0.3)

    print(f"\n完成：{done} 翻译 / {skipped} 跳过(已存在) / {failed} 失败")

# ─────────────────────── CLI ───────────────────────

def main():
    parser = argparse.ArgumentParser(description="GeoGebra 文档汉化脚本（支持 Gemini / Qwen / GLM）")
    parser.add_argument("src", help="源文件（en/Foo/index.htm）或源目录（--batch 模式）")
    parser.add_argument("dst", help="目标文件（zh/Foo/index.htm）或目标目录（--batch 模式）")
    parser.add_argument("--api-key", default="", help="GLM API Key（也可通过环境变量 GLM_API_KEY 设置）")
    parser.add_argument("--batch", action="store_true", help="批量翻译目录")
    parser.add_argument("--model", default="", help="指定模型名（默认按优先级自动选择）")
    parser.add_argument("--api", choices=["gemini", "qwen", "glm"], default="gemini",
                        help="API 后端：gemini（本地Gemini代理，默认）| qwen（阿里千问）| glm（智谱GLM）")
    parser.add_argument("--terminology", default="", help="terminology.md 路径（默认自动查找）")
    args = parser.parse_args()

    # 加载术语表
    global TERMINOLOGY, SYSTEM_PROMPT
    TERMINOLOGY = load_terminology(args.terminology)
    SYSTEM_PROMPT = build_system_prompt(TERMINOLOGY)

    # 注入指定的模型名
    if args.model:
        if args.api == "gemini":
            GEMINI_CONFIG["models"] = [args.model] + [m for m in GEMINI_CONFIG["models"] if m != args.model]

    # 检查 API Key
    if args.api == "glm":
        api_key = args.api_key or os.environ.get("GLM_API_KEY", "") or os.environ.get("ZHIPUAI_API_KEY", "")
        if not api_key:
            print("错误：使用 GLM 时请通过 --api-key 或环境变量 GLM_API_KEY 提供 API Key")
            sys.exit(1)
    elif args.api == "qwen":
        if not QWEN_CONFIG["api_key"]:
            print("错误：使用 Qwen 时请设置环境变量 QWEN_API_KEY")
            sys.exit(1)
    elif args.api == "gemini":
        if not GEMINI_CONFIG["api_key"]:
            print("警告：未设置 GEMINI_API_KEY 环境变量，本地代理可能不需要")

    if args.batch:
        api_key = args.api_key if args.api == "glm" else ""
        batch_translate(args.src, args.dst, api_key=api_key, api=args.api, model=args.model)
    else:
        ok = translate_file(args.src, args.dst, api_key=args.api_key if args.api == "glm" else "", api=args.api, model=args.model)
        sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
