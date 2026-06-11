# GeoGebra 材料下载脚本
# 功能：从 GeoGebra API 下载中文几何材料并解压
# 
# API 说明：
# - 材料列表接口: https://api.geogebra.org/v1.0/topics/geometry/materials
# - 参数: language=zh-CN（中文）, offset（偏移量）, limit（每页数量）
# - 返回结果包含材料的基本信息和下载链接
# 
# 下载流程：
# 1. 获取材料列表（每页50条）
# 2. 过滤掉已下载的材料
# 3. 下载 .ggb 文件（ZIP格式）
# 4. 解压到 /docs/sample/{id}/ 目录
# 5. 下载缩略图和预览图
# 6. 生成材料列表 materials.json

import os
import json
import requests
import zipfile

# 基础配置
BASE_DIR = "../../sample"  # 下载目录（相对于脚本位置）
API_BASE = "https://api.geogebra.org/v1.0"  # GeoGebra API 基础地址

def get_material_detail(material_id):
    """获取材料详细信息"""
    url = f"{API_BASE}/materials/{material_id}"
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    return response.json()

def get_material_list(offset=0, limit=50):
    """获取 GeoGebra 材料列表"""
    url = f"{API_BASE}/topics/geometry/materials"
    params = {
        "language": "zh-CN",
        "offset": offset,
        "order": "magic",
        "limit": limit,
        "embed": "creator"
    }
    print(f"正在获取材料列表 (offset={offset}, limit={limit})...")
    response = requests.get(url, params=params, timeout=15)
    response.raise_for_status()
    data = response.json()
    return data

def download_material(material_id, output_dir=BASE_DIR):
    """下载 GeoGebra 材料（支持普通材料和书籍类型）"""
    # 检查是否已下载
    material_dir = os.path.join(output_dir, material_id)
    already_downloaded = os.path.exists(material_dir)
    
    if already_downloaded:
        print(f"  已跳过（已下载）")
    
    os.makedirs(material_dir, exist_ok=True)
    temp_zip = os.path.join(output_dir, "temp_ggb.zip")

    print(f"正在下载 GeoGebra 材料: {material_id} ...")

    # 1. 获取材料详细信息
    try:
        detail = get_material_detail(material_id)
        
        # 检查是否是书籍类型
        if detail.get('type') == 'book' and detail.get('chapters'):
            print(f"  这是一本 GeoGebra Book，包含 {len(detail['chapters'])} 个章节")
            # 遍历所有章节和页面
            page_count = 0
            for chapter in detail['chapters']:
                pages = chapter.get('pages', [])
                for page in pages:
                    page_id = page.get('id')
                    if page_id:
                        print(f"    章节 '{chapter.get('title', '未命名章节')}' 的页面: {page_id}")
                        page_result = download_material(page_id, output_dir)
                        if page_result:
                            page_count += 1
            print(f"  书籍处理完成，共 {page_count} 个页面")
            return True
        
        # 普通材料：查找下载链接
        download_url = None
        thumb_url = None
        preview_url = None
        
        elements = detail.get('elements', [])
        for elem in elements:
            if 'url' in elem:
                download_url = elem.get('url')
                thumb_url = elem.get('thumbUrl')
                preview_url = elem.get('previewUrl')
                break
        
        if not download_url:
            print(f"  未找到下载链接")
            return False
        
        # 输出下载地址到日志（无论是否下载）
        print(f"  下载链接: {download_url}")
        if thumb_url:
            print(f"  缩略图: {thumb_url}")
        if preview_url:
            print(f"  预览图: {preview_url}")
            
        # 如果已下载，跳过实际下载
        if already_downloaded:
            return True
        
        print(f"  开始下载...")
        
    except Exception as e:
        print(f"  获取材料详细信息失败: {e}")
        import traceback
        traceback.print_exc()
        return False

    # 2. 下载 GGB 文件
    try:
        response = requests.get(download_url, timeout=30)
        if response.status_code != 200:
            print(f"下载失败，状态码: {response.status_code}")
            return False
        
        with open(temp_zip, "wb") as f:
            f.write(response.content)
        print(f"下载完成: {temp_zip} ({len(response.content)} bytes)")

    except Exception as e:
        print(f"下载出错: {e}")
        return False

    # 3. 解压文件
    try:
        with zipfile.ZipFile(temp_zip, 'r') as archive:
            archive.extractall(material_dir)
        print(f"解压完成")
    except Exception as e:
        print(f"解压文件出错: {e}")
        if os.path.exists(temp_zip):
            os.remove(temp_zip)
        return False
    finally:
        if os.path.exists(temp_zip):
            os.remove(temp_zip)

    # 4. 下载缩略图
    if thumb_url:
        try:
            print(f"正在下载缩略图...")
            response = requests.get(thumb_url, timeout=15)
            if response.status_code == 200:
                thumb_path = os.path.join(material_dir, "thumbnail.png")
                with open(thumb_path, "wb") as f:
                    f.write(response.content)
                print(f"缩略图已保存: {thumb_path}")
        except Exception as e:
            print(f"缩略图下载失败: {e}")
    
    # 5. 下载预览图
    if preview_url:
        try:
            print(f"正在下载预览图...")
            response = requests.get(preview_url, timeout=15)
            if response.status_code == 200:
                preview_path = os.path.join(material_dir, "preview.png")
                with open(preview_path, "wb") as f:
                    f.write(response.content)
                print(f"预览图已保存: {preview_path}")
        except Exception as e:
            print(f"预览图下载失败: {e}")

    print(f"下载完成！\n")
    return True


def save_materials_list(new_materials=None):
    """保存材料列表到 materials.json"""
    materials = []
    new_materials = new_materials or []
    new_materials_dict = {m['id']: m for m in new_materials}
    
    if os.path.exists(BASE_DIR):
        for item in os.listdir(BASE_DIR):
            item_path = os.path.join(BASE_DIR, item)
            if os.path.isdir(item_path):
                # 检查是否包含 geogebra.xml 文件
                xml_file = os.path.join(item_path, "geogebra.xml")
                if os.path.exists(xml_file):
                    # 优先使用新下载的标题和描述
                    title = new_materials_dict.get(item, {}).get('title', item)
                    description = new_materials_dict.get(item, {}).get('description', '未指定描述')
                    materials.append({
                        "id": item,
                        "title": title,
                        "description": description,
                        "rating": 0,
                        "manualRating": None
                    })

    # 尝试从之前的下载记录中获取标题和描述
    materials_file = os.path.join(BASE_DIR, "materials.json")
    if os.path.exists(materials_file):
        try:
            with open(materials_file, 'r', encoding='utf-8') as f:
                existing = json.load(f)
            # 更新已存在的信息（新下载的优先）
            existing_dict = {m['id']: m for m in existing}
            for m in materials:
                if m['id'] not in new_materials_dict and m['id'] in existing_dict:
                    existing_item = existing_dict[m['id']]
                    m['title'] = existing_item.get('title', m['id'])
                    m['description'] = existing_item.get('description', '未指定描述')
                    m['rating'] = existing_item.get('rating', 0)
                    m['manualRating'] = existing_item.get('manualRating', None)
        except:
            pass
    
    # 保存
    with open(materials_file, 'w', encoding='utf-8') as f:
        json.dump(materials, f, ensure_ascii=False, indent=2)
    
    print(f"材料列表已保存到: {materials_file}")


# 测试下载
if __name__ == "__main__":
    print("=" * 50)
    print("测试：获取材料列表并下载新的20个")
    print("=" * 50)

    try:
        # 1. 获取本地已下载的材料列表
        downloaded_ids = set()
        if os.path.exists(BASE_DIR):
            for item in os.listdir(BASE_DIR):
                item_path = os.path.join(BASE_DIR, item)
                if os.path.isdir(item_path):
                    xml_file = os.path.join(item_path, "geogebra.xml")
                    if os.path.exists(xml_file):
                        downloaded_ids.add(item)
        print(f"本地已下载 {len(downloaded_ids)} 个材料")

        # 2. 获取材料列表，过滤掉已下载的，获取新的20个
        all_items = []
        offset = 0
        limit = 50
        target_count = 20
        
        print("正在获取材料列表...")
        while len(all_items) < target_count:
            print(f"  获取 offset={offset}...")
            data = get_material_list(offset=offset, limit=limit)
            items = data if isinstance(data, list) else data.get('items', [])
            if not items:
                break
            
            # 过滤掉已下载的
            new_items = [item for item in items if item.get('id') not in downloaded_ids]
            all_items.extend(new_items)
            
            offset += limit
            if len(items) < limit:
                break
        
        # 只取前20个新的
        all_items = all_items[:target_count]
        print(f"获取到 {len(all_items)} 个新材料")

        for item in all_items:
            print(f"  ID: {item.get('id')}, 标题: {item.get('title', '无标题')}")

        # 3. 下载新材料
        downloaded_count = 0
        skipped_count = len(downloaded_ids)
        
        # 记录下载的材料信息（包含标题）
        downloaded_materials = []
        
        for item in all_items:
            material_id = item.get('id')
            material_title = item.get('title', material_id)
            if not material_id:
                continue
                
            print("\n" + "=" * 50)
            print(f"下载 ID: {material_id}")
            print("=" * 50)
            
            try:
                download_material(material_id)
                downloaded_count += 1
                downloaded_materials.append({
                    "id": material_id,
                    "title": material_title
                })
            except Exception as e:
                print(f"下载失败: {e}")
        
        print("\n" + "=" * 50)
        print(f"下载完成！")
        print(f"本次下载: {downloaded_count} 个")
        print(f"已跳过（已下载）: {skipped_count} 个")
        print(f"总计已下载: {len(downloaded_ids) + downloaded_count} 个")
        print("=" * 50)
        
        # 4. 保存材料列表到 materials.json
        save_materials_list(downloaded_materials)

    except Exception as e:
        print(f"错误: {e}")
