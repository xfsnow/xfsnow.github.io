import os
import re
import json
import sys
from bs4 import BeautifulSoup

# 设置标准输出编码为 UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ====================== 【配置项】你只需要改这里 ======================
# 你本地下载的 GeoGebra 官方手册根文件夹（填你自己的路径）
INPUT_FOLDER = r"D:\data\Download\geogebra\geogebra.github.io\docs\manual\en"
# 输出文件夹
OUTPUT_FOLDER = "geogebra_rule_lib"
# =====================================================================

# 自动创建输出目录
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# 命令分类（官方手册固定结构）
CATEGORIES = {
    "点线向量": ["Point", "Segment", "Line", "Ray", "Vector"],
    "圆形圆弧": ["Circle", "CircularArc", "Sector", "Annulus"],
    "多边形": ["Polygon", "RegularPolygon", "Star", "RoundedPolygon"],
    "几何中心": ["Centroid", "Incenter", "Circumcenter", "Orthocenter", "NinePointCenter"],
    "辅助线": ["AngleBisector", "PerpendicularBisector", "Parallel", "Perpendicular", "Tangent"],
    "计算测量": ["Distance", "Angle", "Area", "Midpoint", "Intersection"],
    "变换": ["Rotate", "Reflect", "Translate", "Dilate"],
    "函数曲线": ["Curve", "PolarCurve", "Ellipse", "Parabola", "Hyperbola"],
    "样式设置": ["SetColor", "SetLineThickness", "SetOpacity", "Text"],
}

def clean_text(text):
    """清理文本，去除多余空白"""
    text = re.sub(r"\n+", "\n", text)
    text = re.sub(r" +", " ", text)
    return text.strip()

def extract_commands_from_html(filepath):
    """从 HTML 文件中提取 GeoGebra 命令信息"""
    try:
        # 尝试多种编码方式读取文件
        content = None
        encodings = ['utf-8', 'latin-1', 'gbk', 'iso-8859-1']
        
        for encoding in encodings:
            try:
                with open(filepath, "r", encoding=encoding) as f:
                    content = f.read()
                break
            except UnicodeDecodeError:
                continue
        
        if content is None:
            print(f"   ⚠️  无法解码文件：{filepath}")
            return None
        
        soup = BeautifulSoup(content, "html.parser")

        # 获取页面标题作为命令名
        title_tag = soup.find("h1", class_="page")
        if not title_tag:
            return None
        
        page_title = title_tag.get_text().strip()
        
        # 过滤掉非命令页面（如索引页、概览页）
        # 命令页面的标题通常是 "XXX Command" 或就是命令名本身
        if page_title in ["Commands", "Tools", "Manual"]:
            return None
        
        # 提取真正的命令名（去掉 "Command" 后缀）
        command_name = page_title.replace(" Command", "").replace(" Tool", "").strip()
        
        # 检查是否是已知分类中的命令
        matched_category = None
        for cat, keywords in CATEGORIES.items():
            if command_name in keywords:
                matched_category = cat
                break
        
        # 如果没有匹配到预定义分类，但仍然可能是命令（单个大写字母开头的词）
        if not matched_category:
            # 检查是否是大写字母开头的单词（典型的 GeoGebra 命令格式）
            if not re.match(r'^[A-Z][a-zA-Z_]*$', command_name):
                return None
            matched_category = "其他"
        
        # 提取主要内容区域
        article = soup.find("article", class_="doc")
        if not article:
            article = soup.find("main")
        
        if not article:
            return None
        
        # 方法1：从定义列表 (<dl>) 中提取语法
        syntax_list = []
        definition_lists = article.find_all("dl")
        for dl in definition_lists:
            # 查找 dt 标签（定义术语），通常包含语法
            for dt in dl.find_all("dt"):
                dt_text = dt.get_text(separator=" ", strip=True)
                # 检查是否包含命令名和括号
                if command_name.lower() in dt_text.lower() and "(" in dt_text:
                    cleaned = clean_text(dt_text)
                    if cleaned and cleaned not in syntax_list:
                        syntax_list.append(cleaned)
        
        # 方法2：从代码块中提取
        if not syntax_list:
            code_blocks = article.find_all(["code", "pre"])
            for code in code_blocks:
                code_text = code.get_text(strip=True)
                if code_text and "(" in code_text and len(code_text) < 200:
                    # 检查是否包含命令名
                    if command_name.lower() in code_text.lower():
                        syntax_list.append(code_text)
        
        # 方法3：从表格中提取
        if not syntax_list:
            tables = article.find_all("table")
            for table in tables:
                for cell in table.find_all(["td", "th"]):
                    cell_text = cell.get_text(strip=True)
                    if "(" in cell_text and ")" in cell_text and command_name.lower() in cell_text.lower():
                        syntax_list.append(cell_text)
        
        # 方法4：从段落文本中提取语法模式（新增）
        if not syntax_list:
            paragraphs = article.find_all("p")
            for p in paragraphs:
                p_text = p.get_text(separator=" ", strip=True)
                # 查找类似 Command(...) 的模式
                patterns = re.findall(rf'{re.escape(command_name)}\s*\([^)]*\)', p_text, re.IGNORECASE)
                for pattern in patterns[:3]:  # 最多取3个
                    cleaned = clean_text(pattern)
                    if cleaned and cleaned not in syntax_list and len(cleaned) < 200:
                        syntax_list.append(cleaned)
        
        # 方法5：从列表项中提取（新增）
        if not syntax_list:
            list_items = article.find_all("li")
            for li in list_items:
                li_text = li.get_text(separator=" ", strip=True)
                # 查找类似 Command(...) 的模式
                patterns = re.findall(rf'{re.escape(command_name)}\s*\([^)]*\)', li_text, re.IGNORECASE)
                for pattern in patterns[:2]:
                    cleaned = clean_text(pattern)
                    if cleaned and cleaned not in syntax_list and len(cleaned) < 200:
                        syntax_list.append(cleaned)
        
        # 提取示例（从描述文本中提取包含命令的示例）
        example_list = []
        
        # 从定义列表的 dd 标签中提取示例
        for dl in definition_lists:
            dts = dl.find_all("dt")
            dds = dl.find_all("dd")
            
            for i, dt in enumerate(dts):
                if i < len(dds):
                    dd = dds[i]
                    dd_text = dd.get_text(separator=" ", strip=True)
                    
                    # 如果描述中包含命令调用示例
                    if "(" in dd_text and ")" in dd_text:
                        # 尝试提取类似 Command(...) 的模式
                        patterns = re.findall(rf'{re.escape(command_name)}\([^)]*\)', dd_text, re.IGNORECASE)
                        for pattern in patterns[:2]:
                            cleaned = clean_text(pattern)
                            if cleaned and cleaned not in example_list:
                                example_list.append(cleaned)
        
        # 如果还是没有找到示例，使用语法列表作为示例
        if not example_list and syntax_list:
            example_list = syntax_list[:2]
        
        # 至少需要有语法列表
        if not syntax_list:
            return None
        
        return {
            "command": command_name,
            "syntax_list": syntax_list,
            "valid_example": example_list if example_list else syntax_list[:2],
            "category": matched_category
        }
    except Exception as e:
        # 只在真正出错时打印（不是编码问题）
        if "codec can't decode" not in str(e):
            print(f"   错误详情: {str(e)}")
        return None

def run_auto_extract():
    all_commands = []
    total_files = 0
    processed_files = 0
    skipped_files = 0
    skip_reasons = {}  # 记录跳过原因
    
    # 检查输入文件夹是否存在
    if not os.path.exists(INPUT_FOLDER):
        print(f"❌ 错误：输入文件夹不存在：{INPUT_FOLDER}")
        return
    
    print(f"📂 开始扫描文件夹：{INPUT_FOLDER}\n")
    
    for root, dirs, files in os.walk(INPUT_FOLDER):
        for file in files:
            if file.endswith(".htm"):
                total_files += 1
                path = os.path.join(root, file)
                
                try:
                    cmd = extract_commands_from_html(path)
                    if cmd:
                        all_commands.append(cmd)
                        processed_files += 1
                        print(f"✅ [{processed_files}] 提取命令：{cmd['command']} (来自 {file})")
                    else:
                        skipped_files += 1
                        
                        # 分析跳过原因
                        reason = analyze_skip_reason(path)
                        skip_reasons[reason] = skip_reasons.get(reason, 0) + 1
                        
                        if skipped_files <= 20:  # 显示前20个跳过的文件及原因
                            print(f"⚠️  跳过文件：{file} - 原因: {reason}")
                except Exception as e:
                    print(f"❌ 处理文件失败 {file}: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"📊 统计信息：")
    print(f"   - 总 HTM 文件数：{total_files}")
    print(f"   - 成功提取命令：{processed_files}")
    print(f"   - 跳过文件数：{skipped_files}")
    print(f"{'='*60}\n")
    
    # 显示跳过原因统计
    if skip_reasons:
        print("📋 跳过原因统计：")
        for reason, count in sorted(skip_reasons.items(), key=lambda x: x[1], reverse=True):
            print(f"   - {reason}: {count} 个文件")
        print()
    
    if processed_files == 0:
        print("⚠️  警告：没有提取到任何命令！可能的原因：")
        print("   1. HTM 文件结构与预期不符")
        print("   2. 命令关键词不在预定义的 CATEGORIES 中")
        print("   3. 无法匹配 Syntax 模式")
        print("   4. 请检查示例 HTM 文件的实际结构\n")
        # 输出一些调试信息
        print("💡 建议：打开一个 .htm 文件，查看其 HTML 结构")
        print("   重点查找：<h1>, <dl>, <dt>, <dd>, <code>, <pre>, <table> 等标签\n")
        return
    
    # 保存JSON结构化规则库（给向量库 + 校验器使用）
    json_path = os.path.join(OUTPUT_FOLDER, "geogebra_commands.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_commands, f, ensure_ascii=False, indent=2)
    print(f"💾 JSON 文件已保存：{json_path}")
    
    # 保存全局规则（单独文件，避免重复）
    global_rules_path = os.path.join(OUTPUT_FOLDER, "geogebra_global_rules.json")
    global_rules = {
        "global_rules": [
            "单行单命令",
            "仅使用英文小括号()",
            "禁止分号; 禁止方括号[]",
            "坐标格式：(x,y)",
            "命令首字母大写"
        ],
        "param_rule": "参数使用英文小括号()，坐标格式(x,y)，单行单命令",
        "invalid_patterns": [
            "Command[...]",
            "Command(...);Command(...)"
        ],
        "description": "这些是 GeoGebra 命令的全局强制规则，适用于所有命令"
    }
    with open(global_rules_path, "w", encoding="utf-8") as f:
        json.dump(global_rules, f, ensure_ascii=False, indent=2)
    print(f"💾 全局规则已保存：{global_rules_path}")

    # 保存分类规则库（给Prompt使用）
    rule_txt = os.path.join(OUTPUT_FOLDER, "geogebra_rules.txt")
    with open(rule_txt, "w", encoding="utf-8") as f:
        f.write("=== GEOGEBRA 全局强制规则 ===\n")
        f.write("1. 单行单命令\n")
        f.write("2. 仅使用英文小括号()\n")
        f.write("3. 禁止分号; 禁止方括号[]\n")
        f.write("4. 坐标格式：(x,y)\n")
        f.write("5. 命令首字母大写\n\n")

        for cat in CATEGORIES.keys():
            f.write(f"\n【{cat}】\n")
            for cmd in all_commands:
                if cmd['category'] == cat:
                    f.write(f"命令：{cmd['command']}\n")
                    for s in cmd['syntax_list']:
                        f.write(f"  语法：{s}\n")
                    for e in cmd['valid_example'][:2]:
                        f.write(f"  示例：{e}\n")
                    f.write("\n")
    
    print(f"💾 规则文本已保存：{rule_txt}")
    print(f"\n🎉 自动化提纯完成！")
    print(f"📁 规则库输出到：{OUTPUT_FOLDER}")
    print(f"📜 命令总数：{len(all_commands)}")

def analyze_skip_reason(filepath):
    """分析文件被跳过的原因"""
    try:
        # 尝试读取文件
        content = None
        encodings = ['utf-8', 'latin-1', 'gbk', 'iso-8859-1']
        
        for encoding in encodings:
            try:
                with open(filepath, "r", encoding=encoding) as f:
                    content = f.read()
                break
            except UnicodeDecodeError:
                continue
        
        if content is None:
            return "编码问题"
        
        soup = BeautifulSoup(content, "html.parser")
        
        # 检查是否有页面标题
        title_tag = soup.find("h1", class_="page")
        if not title_tag:
            return "无页面标题(h1.page)"
        
        page_title = title_tag.get_text().strip()
        
        # 检查是否是索引页或概览页
        if page_title in ["Commands", "Tools", "Manual"]:
            return f"索引页({page_title})"
        
        # 提取命令名
        command_name = page_title.replace(" Command", "").replace(" Tool", "").strip()
        
        # 检查是否符合命令命名规则
        if not re.match(r'^[A-Z][a-zA-Z_]*$', command_name):
            return f"非标准命令名({command_name})"
        
        # 检查是否有文章内容区域
        article = soup.find("article", class_="doc") or soup.find("main")
        if not article:
            return "无文章内容区域"
        
        # 检查是否有定义列表
        definition_lists = article.find_all("dl")
        has_dt_with_command = False
        for dl in definition_lists:
            for dt in dl.find_all("dt"):
                dt_text = dt.get_text(separator=" ", strip=True)
                if "(" in dt_text and command_name.lower() in dt_text.lower():
                    has_dt_with_command = True
                    break
        
        if not has_dt_with_command:
            # 检查是否有代码块
            code_blocks = article.find_all(["code", "pre"])
            has_code = False
            for code in code_blocks:
                code_text = code.get_text(strip=True)
                if "(" in code_text and command_name.lower() in code_text.lower():
                    has_code = True
                    break
            
            if not has_code:
                return "无语法定义(dl/dt或code)"
        
        return "未找到语法定义"
        
    except Exception as e:
        return f"分析错误({str(e)[:50]})"

if __name__ == "__main__":
    run_auto_extract()
