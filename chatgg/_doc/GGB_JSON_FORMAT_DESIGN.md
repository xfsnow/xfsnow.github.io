# GeoGebra 命令 JSON 格式设计方案

## 当前问题

目前从 AI 的文本响应中解析 GeoGebra 命令存在以下问题：
1. **解析不稳定**：依赖正则表达式匹配代码块，容易出错
2. **格式不统一**：AI 可能用不同的方式输出命令
3. **缺少元数据**：无法获取命令的描述、分类等信息
4. **渲染困难**：难以在对话中动态创建 GeoGebra 画板

## 解决方案：结构化 JSON 响应

### 方案 A：纯 JSON 格式（推荐）⭐

让 AI 直接返回 JSON 格式，包含文字说明和 GeoGebra 命令。

#### JSON 结构定义

```json
{
  "explanation": "我将为你绘制一个等边三角形...",
  "steps": [
    {
      "step": 1,
      "description": "定义第一个顶点 A",
      "command": "A = (0, 0)"
    },
    {
      "step": 2,
      "description": "定义第二个顶点 B",
      "command": "B = (4, 0)"
    },
    {
      "step": 3,
      "description": "计算第三个顶点 C",
      "command": "C = Rotate[B, 60°, A]"
    },
    {
      "step": 4,
      "description": "连接三个顶点形成三角形",
      "command": "polygon = Polygon[A, B, C]"
    }
  ],
  "commands": [
    "A = (0, 0)",
    "B = (4, 0)",
    "C = Rotate[B, 60°, A]",
    "polygon = Polygon[A, B, C]"
  ],
  "metadata": {
    "objectCount": 4,
    "viewRange": {
      "xMin": -1,
      "xMax": 5,
      "yMin": -1,
      "yMax": 4
    },
    "tags": ["triangle", "geometry"]
  }
}
```

#### 优点
- ✅ **易于解析**：直接 `JSON.parse()` 即可
- ✅ **结构化**：步骤清晰，便于展示
- ✅ **可扩展**：可以添加更多元数据
- ✅ **容错性好**：即使部分字段缺失也能工作

#### 缺点
- ❌ AI 需要学习新的输出格式
- ❌ 需要在 system prompt 中详细说明格式

---

### 方案 B：混合格式（兼容性好）

AI 返回 Markdown 文本，但在特殊代码块中包含 JSON。

#### 示例输出

```markdown
我将为你绘制一个等边三角形。

首先定义三个顶点，然后连接它们形成三角形。

```ggb-json
{
  "commands": [
    "A = (0, 0)",
    "B = (4, 0)",
    "C = Rotate[B, 60°, A]",
    "polygon = Polygon[A, B, C]"
  ],
  "viewRange": {
    "xMin": -1,
    "xMax": 5,
    "yMin": -1,
    "yMax": 4
  }
}
```

这样你就可以看到三角形的构造过程...
```

#### 优点
- ✅ **向后兼容**：仍然可以显示文字说明
- ✅ **易于提取**：只需解析 `ggb-json` 代码块
- ✅ **灵活**：可以选择只使用 JSON 或同时使用文本

#### 缺点
- ⚠️ 仍需解析代码块（但更简单）

---

### 方案 C：函数调用格式（最先进）

如果 AI 提供商支持 Function Calling，可以定义专门的 GeoGebra 工具。

#### OpenAI Function Definition

```json
{
  "name": "create_geogebra_drawing",
  "description": "创建 GeoGebra 几何图形",
  "parameters": {
    "type": "object",
    "properties": {
      "explanation": {
        "type": "string",
        "description": "用中文解释绘图步骤"
      },
      "commands": {
        "type": "array",
        "items": {"type": "string"},
        "description": "GeoGebra 命令列表"
      },
      "viewRange": {
        "type": "object",
        "properties": {
          "xMin": {"type": "number"},
          "xMax": {"type": "number"},
          "yMin": {"type": "number"},
          "yMax": {"type": "number"}
        }
      }
    },
    "required": ["explanation", "commands"]
  }
}
```

#### 优点
- ✅ **最可靠**：AI 必须按照 schema 返回
- ✅ **类型安全**：自动验证数据结构
- ✅ **标准化**：符合 OpenAI 最佳实践

#### 缺点
- ❌ 需要 API 支持 Function Calling
- ❌ 智谱等国内 API 可能不支持

---

## 推荐实施方案

### 第一阶段：方案 B（混合格式）

**原因：**
1. 实现简单，改动小
2. 兼容现有代码
3. 不需要 API 特殊支持

**System Prompt 修改：**

```
你是一个GeoGebra几何绘图专家。请根据用户的几何作图需求，生成正确的GeoGebra命令。

规则：
1. 先用自然语言解释绘图思路和步骤
2. 然后将所有GeoGebra命令放在一个 ```ggb-json``` 代码块中，格式为JSON：
   {
     "commands": ["命令1", "命令2", ...],
     "viewRange": {"xMin": -10, "xMax": 10, "yMin": -10, "yMax": 10}
   }
3. commands 数组中的每个命令使用GeoGebra脚本格式，如 Circle[A, B]
4. viewRange 指定合适的视图范围
5. 最后在代码块后补充说明或注意事项

示例：

我来画一个等边三角形。

首先定义三个顶点，然后连接它们。

```ggb-json
{
  "commands": [
    "A = (0, 0)",
    "B = (4, 0)",
    "C = Rotate[B, 60°, A]",
    "triangle = Polygon[A, B, C]"
  ],
  "viewRange": {
    "xMin": -1,
    "xMax": 5,
    "yMin": -1,
    "yMax": 4
  }
}
```

这样就完成了等边三角形的绘制。
```

**前端解析代码：**

```javascript
// 从 AI 响应中提取 JSON 命令
function extractGGBCommands(content) {
  // 尝试匹配 ggb-json 代码块
  const jsonMatch = content.match(/```ggb-json\s*([\s\S]*?)```/);
  
  if (jsonMatch) {
    try {
      const jsonData = JSON.parse(jsonMatch[1]);
      return {
        success: true,
        commands: jsonData.commands || [],
        viewRange: jsonData.viewRange || null,
        explanation: content.replace(/```ggb-json[\s\S]*?```/g, '').trim()
      };
    } catch (e) {
      console.error('JSON 解析失败:', e);
      return { success: false, error: 'JSON 格式错误' };
    }
  }
  
  // 回退到旧的解析方式
  return parseOldFormat(content);
}
```

---

### 第二阶段：方案 A（纯 JSON）

如果第一阶段效果好，可以升级到纯 JSON 格式。

**System Prompt 修改：**

```
你是一个GeoGebra几何绘图专家。你必须以严格的JSON格式返回结果。

返回格式：
{
  "explanation": "用中文简要解释绘图思路",
  "commands": ["命令1", "命令2", ...],
  "viewRange": {"xMin": -10, "xMax": 10, "yMin": -10, "yMax": 10}
}

重要：
1. 只返回JSON，不要有任何其他文字
2. commands 数组中的命令使用GeoGebra脚本格式
3. viewRange 设置合理的视图范围
4. 确保JSON格式正确，可以被解析
```

**前端处理：**

```javascript
// 直接解析 JSON
async function handleAIResponse(content) {
  try {
    const data = JSON.parse(content);
    
    // 显示解释文字
    addMessageToUI(data.explanation, 'assistant');
    
    // 创建 GeoGebra 画板并执行命令
    createGGBApplet(data.commands, data.viewRange);
    
  } catch (e) {
    // 如果解析失败，尝试作为普通文本处理
    console.error('JSON 解析失败，回退到文本模式', e);
    handleTextResponse(content);
  }
}
```

---

## UI 展示建议

### 消息气泡设计

```
┌─────────────────────────────────────┐
│ 👤 用户                              │
│ 画一个等边三角形                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🤖 AI                                │
│                                      │
│ 我来为你绘制一个等边三角形。          │
│                                      │
│ 首先定义三个顶点 A、B、C，           │
│ 然后使用 Polygon 命令连接它们。       │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │   [GeoGebra 画板]               │ │
│ │                                 │ │
│ │        /\\                      │ │
│ │       /  \\                     │ │
│ │      /____\\                    │ │
│ │      A    B                     │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                      │
│ ✓ 已绘制 4 个对象                    │
│ [重新绘制] [复制命令] [导出]         │
└─────────────────────────────────────┘
```

### 功能按钮

每个 GeoGebra 画板下方提供操作按钮：
- **重新绘制**：清空并重绘
- **复制命令**：复制所有命令到剪贴板
- **导出图片**：导出为 PNG/SVG
- **全屏查看**：最大化画板
- **反馈给 AI**：发送错误信息让 AI 修正

---

## 实施步骤

1. ✅ 修改 system prompt，要求 AI 使用 JSON 格式
2. ✅ 实现 JSON 解析函数 `extractGGBCommands()`
3. ✅ 创建 GeoGebra 画板渲染函数 `createGGBApplet()`
4. ✅ 在消息气泡中嵌入画板
5. ✅ 添加操作按钮（重绘、复制、导出等）
6. ✅ 测试各种场景（成功、失败、部分成功）
7. ✅ 添加错误处理和重试机制

---

## 总结

**推荐路径：**
1. 先用**方案 B（混合格式）**快速实现
2. 测试效果，收集用户反馈
3. 如果稳定，升级到**方案 A（纯 JSON）**
4. 如果 API 支持，考虑**方案 C（Function Calling）**

**关键优势：**
- 🎯 解析更可靠，不再依赖脆弱的正则表达式
- 🎨 可以在对话中直接渲染多个 GeoGebra 画板
- 📊 结构化数据便于统计和分析
- 🔧 更容易调试和维护

需要我帮你实现这个方案吗？
