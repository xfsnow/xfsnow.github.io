# 评分保存后端服务
# 使用 Flask 创建简单的 REST API 来保存评分
# 运行方式: python rating_server.py

from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

# 添加 CORS 支持
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# 处理 OPTIONS 预检请求
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 200

# 材料列表文件路径
MATERIALS_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), 'materials.json'))
# 评分数据文件路径（单独存储）
RATINGS_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), 'ratings.json'))

def load_ratings():
    """加载评分数据"""
    if os.path.exists(RATINGS_FILE):
        with open(RATINGS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_ratings(ratings):
    """保存评分数据"""
    with open(RATINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(ratings, f, ensure_ascii=False, indent=2)

@app.route('/api/rating', methods=['POST'])
def save_rating():
    """保存评分和备注"""
    try:
        data = request.get_json()
        material_id = data.get('id')
        rating = data.get('rating')
        note = data.get('note', '')
        
        if not material_id or rating is None:
            return jsonify({'error': '缺少参数'}), 400
        
        # 读取现有的评分数据
        ratings = load_ratings()
        
        # 更新或创建评分记录
        if material_id not in ratings:
            ratings[material_id] = {}
        ratings[material_id]['rating'] = int(rating)
        if note:
            ratings[material_id]['note'] = note
        
        # 保存到单独的文件
        save_ratings(ratings)
        
        return jsonify({'success': True, 'message': '评分保存成功'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ratings', methods=['GET'])
def get_ratings():
    """获取所有评分数据"""
    try:
        ratings = load_ratings()
        return jsonify(ratings)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/materials', methods=['GET'])
def get_materials():
    """获取材料列表（包含评分数据）"""
    try:
        with open(MATERIALS_FILE, 'r', encoding='utf-8') as f:
            materials = json.load(f)
        
        # 加载评分数据并合并
        ratings = load_ratings()
        for m in materials:
            material_id = m['id']
            if material_id in ratings:
                if 'rating' in ratings[material_id]:
                    m['manualRating'] = ratings[material_id]['rating']
                if 'note' in ratings[material_id]:
                    m['note'] = ratings[material_id]['note']
        
        return jsonify(materials)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
