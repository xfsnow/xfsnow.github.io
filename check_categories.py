import os
import re
import json

# 读取有效的分类值
with open('en/lang.json', 'r', encoding='utf-8') as f:
    lang_data = json.load(f)
    
valid_categories = list(lang_data['categoryMap'].values())
print("有效的分类值:", valid_categories)

# 获取所有.md文件
md_files = []
for root, dirs, files in os.walk('en'):
    for file in files:
        if file.endswith('.md'):
            md_files.append(os.path.join(root, file))

print(f"\n找到 {len(md_files)} 个.md文件")

# 找到包含"Category:"的文件
files_with_category = []
for file_path in md_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'Category:' in content:
                files_with_category.append(file_path)
    except Exception as e:
        print(f"读取文件 {file_path} 时出错: {e}")

print(f"其中 {len(files_with_category)} 个文件包含'Category:'")

# 检查每个文件的分类值是否有效
invalid_files = []
for file_path in files_with_category:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 提取分类值
        category_match = re.search(r'Category:\s*__([^_\n]+)__', content)
        if category_match:
            category = category_match.group(1).strip()
            if category not in valid_categories:
                invalid_files.append((file_path, category))
                print(f"无效分类: {file_path} -> '{category}'")
        else:
            # 检查是否有其他格式的分类
            category_match = re.search(r'Category:\s*([^\n]+)', content)
            if category_match:
                category_line = category_match.group(1).strip()
                invalid_files.append((file_path, f"格式不正确: {category_line}"))
                print(f"格式不正确: {file_path} -> '{category_line}'")
    except Exception as e:
        print(f"处理文件 {file_path} 时出错: {e}")

print(f"\n总共发现 {len(invalid_files)} 个文件的分类值不在有效范围内或格式不正确:")
for file_path, category in invalid_files:
    print(f"{file_path}: {category}")