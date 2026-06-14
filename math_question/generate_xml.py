#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动调用 qwen3.7-max 生成 GeoGebra XML 绘图命令（多步对话模式）

使用方法：
1. 设置环境变量 QWEN_API_KEY
2. 运行脚本：python generate_xml.py
3. 输出文件：question_xml.js

改进：采用分步对话模式，每步画完后自动回复"继续"，直到完成全部绘图。
"""

import os
import re
import json
import time
import requests
from typing import List, Dict, Tuple


# 分步对话的系统提示词（与 /chatgg/chatxml.js 保持一致）
SYSTEM_PROMPT = """你是GeoGebra几何绘图专家。根据用户的几何作图需求，分步生成XML命令。

格式要求：
1. label属性标识对象，不用name属性
2. 点使用齐次坐标 <coords x="0.0" y="0.0" z="1.0"/>
3. 公式用<expression label="名称" exp="公式" type="类型"/>
4. 几何命令用<command name="命令"><input a0="A" a1="B"/><output a0="结果"/></command>

分步规则：
1. 先分析题目，列出绘图步骤规划（不输出XML）
2. 每步只画1-2个相关元素，输出XML后等待用户确认
3. 用户说"继续"或"下一步"后再画下一步
4. 用户可随时要求调整
5. ⚠️ 重要：每一步输出的XML必须包含**之前所有步骤的完整命令**，不是只输出当前步骤的命令
6. 完成所有步骤后，输出最终完整XML并说明"绘图完成"

示例：
用户：画等边三角形
助手：好的，分步绘制等边三角形。

步骤规划：
1. 定义底边端点A、B
2. 旋转得到顶点C
3. 连接成三角形

第1步：定义点A(0,0)和B(4,0)
```ggb-xml
<construction>
  <element type="point" label="A">
    <coords x="0.0" y="0.0" z="1.0"/>
  </element>
  <element type="point" label="B">
    <coords x="4.0" y="0.0" z="1.0"/>
  </element>
</construction>
```
请确认后说"继续"。

用户：继续
助手：第2步：通过旋转60度得到顶点C
```ggb-xml
<construction>
  <element type="point" label="A">
    <coords x="0.0" y="0.0" z="1.0"/>
  </element>
  <element type="point" label="B">
    <coords x="4.0" y="0.0" z="1.0"/>
  </element>
  <command name="Rotate">
    <input a0="B" a1="60°" a2="A"/>
    <output a0="C"/>
  </command>
  <element type="point" label="C">
    <coords x="2.0" y="3.4641" z="1.0"/>
    <show object="true" label="true"/>
  </element>
</construction>
```
请确认后说"继续"。

用户：继续
助手：第3步：连接三点形成等边三角形
```ggb-xml
<construction>
  <element type="point" label="A">
    <coords x="0.0" y="0.0" z="1.0"/>
  </element>
  <element type="point" label="B">
    <coords x="4.0" y="0.0" z="1.0"/>
  </element>
  <command name="Rotate">
    <input a0="B" a1="60°" a2="A"/>
    <output a0="C"/>
  </command>
  <element type="point" label="C">
    <coords x="2.0" y="3.4641" z="1.0"/>
    <show object="true" label="true"/>
  </element>
  <command name="Polygon">
    <input a0="A" a1="B" a2="C"/>
    <output a0="poly1"/>
  </command>
  <element type="polygon" label="poly1">
    <show object="true" label="false"/>
    <objColor r="100" g="150" b="255" alpha="0.15"/>
  </element>
</construction>
```

绘图完成！这就是一个等边三角形。"""


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


def call_qwen_api(messages: List[Dict], api_key: str, max_retries: int = 3, retry_delay: int = 10) -> str:
    """调用 Qwen API 进行多轮对话（带重试机制）"""
    url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": "qwen-max",
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 4000
    }
    
    # 增加请求超时时间到5分钟（300秒）
    timeout = 300
    
    for attempt in range(max_retries):
        try:
            print(f"      正在发送请求 (第 {attempt + 1}/{max_retries} 次尝试)...")
            response = requests.post(url, headers=headers, json=payload, timeout=timeout)
            response.raise_for_status()
            result = response.json()
            
            if 'choices' in result and len(result['choices']) > 0:
                print(f"      请求成功，耗时约 {response.elapsed.total_seconds():.2f} 秒")
                return result['choices'][0]['message']['content'].strip()
            
            raise ValueError("API 返回格式异常")
        
        except requests.exceptions.Timeout:
            print(f"      请求超时，将在 {retry_delay} 秒后重试...")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
        except requests.exceptions.RequestException as e:
            print(f"      请求异常: {str(e)}")
            if attempt < max_retries - 1:
                print(f"      将在 {retry_delay} 秒后重试...")
                time.sleep(retry_delay)
        except Exception as e:
            print(f"      处理响应失败: {str(e)}")
            if attempt < max_retries - 1:
                print(f"      将在 {retry_delay} 秒后重试...")
                time.sleep(retry_delay)
    
    print("      所有尝试均失败")
    return ""


def extract_xml(response: str) -> str:
    """从响应中提取XML代码（提取 ggb-xml 代码块中的内容）"""
    # 尝试提取 ```ggb-xml 代码块
    match = re.search(r'```ggb-xml\s*\n?([\s\S]*?)\n?```', response, re.DOTALL)
    if match:
        return match.group(1).strip()
    
    # 尝试提取 <construction> 和 </construction> 之间的内容
    match = re.search(r'<construction[\s\S]*?</construction>', response, re.DOTALL)
    if match:
        return match.group(0)
    
    # 如果没有找到，返回空
    return ""


def is_completed(response: str) -> bool:
    """判断AI是否已完成绘图"""
    completion_keywords = ['绘图完成', '绘制完成', '已完成', '全部完成', '图形已完成']
    for keyword in completion_keywords:
        if keyword in response:
            return True
    return False


def generate_xml_multi_step(question: Dict, api_key: str, max_steps: int = 10) -> Tuple[str, int]:
    """多步对话生成XML命令
    
    Args:
        question: 题目数据
        api_key: API密钥
        max_steps: 最大步数限制
    
    Returns:
        (最终XML, 实际步数)
    """
    content = question.get('content', '')
    # 移除图片链接
    content = re.sub(r'!\[img\]\([^)]+\)', '', content)
    # 移除多余空行
    content = re.sub(r'\n{2,}', '\n', content).strip()
    
    # 构建初始消息
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"解题画图：{content}"}
    ]
    
    final_xml = ""
    step_count = 0
    
    print(f"    开始多步对话...")
    
    while step_count < max_steps:
        step_count += 1
        print(f"    第 {step_count} 步对话...")
        
        # 调用API
        response = call_qwen_api(messages, api_key)
        
        if not response:
            print(f"      ❌ 第 {step_count} 步响应失败")
            break
        
        # 提取XML
        xml_content = extract_xml(response)
        if xml_content:
            final_xml = xml_content
            print(f"      ✅ 获取到XML命令 ({len(xml_content)} 字符)")
        
        # 检查是否完成
        if is_completed(response):
            print(f"      🎉 AI报告绘图完成")
            break
        
        # 自动回复"继续"
        messages.append({"role": "assistant", "content": response})
        messages.append({"role": "user", "content": "继续"})
        
        # 步间延迟（避免请求过快）
        if step_count < max_steps:
            print(f"      等待3秒后继续...")
            time.sleep(3)
    
    return final_xml, step_count


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
    total_steps = 0
    
    for i, question in enumerate(questions, 1):
        print(f"\n{'='*60}")
        print(f"正在处理第 {i}/{len(questions)} 题: {question.get('title', '')}")
        print(f"{'='*60}")
        
        # 多步对话生成XML
        xml_content, steps = generate_xml_multi_step(question, api_key)
        total_steps += steps
        
        if not xml_content:
            print(f"  ❌ 最终生成失败")
            xml_content = "<construction></construction>"
        else:
            print(f"  ✅ 最终生成成功，共 {steps} 步对话")
        
        xml_results.append({
            "id": question['id'],
            "title": question['title'],
            "xml": xml_content
        })
        
        # 题目间隔（避免请求过快）
        if i < len(questions):
            print(f"\n等待15秒后继续下一题...")
            time.sleep(15)
    
    # 生成输出文件
    output_data = {
        "exportTime": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
        "description": "GeoGebra XML 绘图命令（多步对话自动生成）",
        "questions": xml_results
    }
    
    with open('question_xml.js', 'w', encoding='utf-8') as f:
        f.write('var question_xml = ')
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        f.write(';')
    
    print(f"\n{'='*60}")
    print(f"✅ 已完成！")
    print(f"   - 处理题目: {len(questions)} 道")
    print(f"   - 总对话步数: {total_steps} 步")
    print(f"   - 输出文件: question_xml.js")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()