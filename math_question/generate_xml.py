#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动调用 qwen3.7-max 生成 GeoGebra XML 绘图命令

使用方法：
1. 设置环境变量 QWEN_API_KEY
2. 运行脚本：python generate_xml.py
3. 输出文件：question_xml.js
"""

import os
import re
import json
import time
import requests
from typing import List, Dict


def read_question_js(file_path: str) -> List[Dict]:
    """读取 question.js 文件，提取题目数据"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 使用正则提取 JSON 数据
    match = re.search(r'var\s+math_question\s*=\s*(\{[\s\S]*\});', content)
    if not match:
        raise ValueError("无法从 question.js 中提取数据")
    
    data = json.loads(match.group(1))
    return data.get('questions', [])


def call_qwen_api(prompt: str, api_key: str, max_retries: int = 3, retry_delay: int = 10) -> str:
    """调用 Qwen API 生成响应（带重试机制）"""
    url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": "qwen-max",
        "messages": [
            {
                "role": "system",
                "content": """
你是一位精通初中数学几何的GeoGebra绘图专家。请根据题目描述生成高质量的GeoGebra XML命令。

**强制格式要求：**
1. 必须使用<command>标签创建所有几何对象，禁止使用复杂的<element>属性
2. 使用<element type="point">定义关键点坐标
3. 使用<command name="Polygon">绘制三角形/四边形
4. 使用<command name="Segment">绘制线段
5. 使用<command name="Line">绘制直线（辅助线）
6. 使用<command name="Reflect">创建对称点
7. 使用<command name="Intersect">求交点
8. 使用<command name="AngleBisector">创建角平分线
9. 使用<command name="PerpendicularLine">创建垂线

**样式设置：**
1. 关键点使用<element type="point" label="A"><coords x="2.0" y="3.4641" z="1.0"/></element>
2. 多边形使用<element type="polygon" label="poly1"><show object="true" label="false"/><objColor r="100" g="150" b="255" alpha="0.15"/></element>
3. 线段颜色：蓝色(0,0,200)、红色(200,0,0)、绿色(0,150,0)、灰色(150,150,150)
4. 辅助线设置为隐藏：<element type="line" label="lineAP"><show object="false" label="false"/></element>

**输出格式：**
- 只输出<construction>和</construction>之间的XML代码
- 不要任何解释文字
- 使用标准GeoGebra XML命令格式

**示例格式：**
<construction>
  <element type="point" label="A"><coords x="2.0" y="3.4641" z="1.0"/></element>
  <element type="point" label="B"><coords x="0.0" y="0.0" z="1.0"/></element>
  <element type="point" label="C"><coords x="4.0" y="0.0" z="1.0"/></element>
  <command name="Polygon"><input a0="A" a1="B" a2="C"/><output a0="poly1"/></command>
  <element type="polygon" label="poly1"><show object="true" label="false"/><objColor r="100" g="150" b="255" alpha="0.15"/></element>
</construction>
"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.3,
        "max_tokens": 3000
    }
    
    # 增加请求超时时间到5分钟（300秒）
    timeout = 300
    
    for attempt in range(max_retries):
        try:
            print(f"    正在发送请求 (第 {attempt + 1}/{max_retries} 次尝试)...")
            response = requests.post(url, headers=headers, json=payload, timeout=timeout)
            response.raise_for_status()
            result = response.json()
            
            if 'choices' in result and len(result['choices']) > 0:
                print(f"    请求成功，耗时约 {response.elapsed.total_seconds():.2f} 秒")
                return result['choices'][0]['message']['content'].strip()
            
            raise ValueError("API 返回格式异常")
        
        except requests.exceptions.Timeout:
            print(f"    请求超时，将在 {retry_delay} 秒后重试...")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
        except requests.exceptions.RequestException as e:
            print(f"    请求异常: {str(e)}")
            if attempt < max_retries - 1:
                print(f"    将在 {retry_delay} 秒后重试...")
                time.sleep(retry_delay)
        except Exception as e:
            print(f"    处理响应失败: {str(e)}")
            if attempt < max_retries - 1:
                print(f"    将在 {retry_delay} 秒后重试...")
                time.sleep(retry_delay)
    
    print("    所有尝试均失败")
    return ""


def generate_prompt(question: Dict) -> str:
    """构建提示词"""
    content = question.get('content', '')
    # 移除图片链接
    content = re.sub(r'!\[img\]\([^)]+\)', '', content)
    # 移除多余空行
    content = re.sub(r'\n{2,}', '\n', content).strip()
    
    prompt = f"""
请根据以下几何题目，生成GeoGebra XML绘图命令：

题目：
{content}

要求：
1. 只输出XML代码，不要其他解释
2. 使用规范的GeoGebra XML格式
3. 关键点坐标合理，图形美观
4. 辅助线设置为隐藏
5. 主要线段使用不同颜色区分
"""
    return prompt


def extract_xml(response: str) -> str:
    """从响应中提取XML代码"""
    # 尝试提取 <construction> 和 </construction> 之间的内容
    match = re.search(r'<construction[\s\S]*?</construction>', response, re.DOTALL)
    if match:
        return match.group(0)
    
    # 如果没有找到完整的标签，返回原始响应
    return response


def main():
    # 获取API密钥
    api_key = os.environ.get('QWEN_API_KEY')
    if not api_key:
        print("错误：请设置环境变量 QWEN_API_KEY")
        return
    
    # 读取题目数据
    questions = read_question_js('question.js')
    print(f"共读取到 {len(questions)} 道题目")
    
    # 生成XML命令
    xml_results = []
    for i, question in enumerate(questions, 1):
        print(f"\n正在处理第 {i}/{len(questions)} 题: {question.get('title', '')}")
        
        prompt = generate_prompt(question)
        response = call_qwen_api(prompt, api_key)
        
        if not response:
            print(f"  ❌ 生成失败")
            xml_content = "<construction></construction>"
        else:
            xml_content = extract_xml(response)
            print(f"  ✅ 生成成功")
        
        xml_results.append({
            "id": question['id'],
            "title": question['title'],
            "xml": xml_content
        })
        
        # 增加请求间隔，避免触发限流（每道题间隔15秒）
        if i < len(questions):
            print(f"    等待15秒后继续下一题...")
            time.sleep(15)
    
    # 生成输出文件
    output_data = {
        "exportTime": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
        "description": "GeoGebra XML 绘图命令（自动生成）",
        "questions": xml_results
    }
    
    with open('question_xml.js', 'w', encoding='utf-8') as f:
        f.write('var question_xml = ')
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        f.write(';')
    
    print(f"\n✅ 已完成！输出文件: question_xml.js")


if __name__ == "__main__":
    main()
