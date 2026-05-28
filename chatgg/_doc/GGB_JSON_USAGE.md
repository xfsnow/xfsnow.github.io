# GeoGebra JSON 格式使用指南

## 概述

ChatGG 现在使用结构化的 JSON 格式来接收 AI 返回的 GeoGebra 命令，这使得解析更可靠，并支持在对话中直接渲染图形。

## AI 响应格式

### 标准格式

AI 应该返回包含文字说明和 JSON 代码块的混合内容：

```markdown
[自然语言解释绘图步骤]

```ggb-json
{
  "commands": ["命令1", "命令2", ...],
  "viewRange": {"xMin": -10, "xMax": 10, "yMin": -10, "yMax": 10}
}
```

[补充说明或注意事项]
```

### 完整示例

**用户输入：**
```
画一个等边三角形
```

**AI 响应：**
```markdown
我来为你绘制一个等边三角形。

首先定义三个顶点 A、B、C，然后使用 Polygon 命令连接它们形成三角形。

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

这样就完成了等边三角形的绘制。你可以看到三个顶点和连接它们的边。
```

## JSON 字段说明

### commands（必需）

**类型：** 字符串数组  
**说明：** GeoGebra 命令列表，按顺序执行

**示例：**
```json
{
  "commands": [
    "A = (0, 0)",
    "B = (3, 4)",
    "circle = Circle[A, B]"
  ]
}
```

**常用命令：**
- 点定义：`A = (x, y)`
- 线段：`Segment[A, B]`
- 圆：`Circle[center, radius]` 或 `Circle[A, B]`（过两点）
- 多边形：`Polygon[A, B, C, ...]`
- 直线：`Line[A, B]`
- 旋转：`Rotate[object, angle, center]`
- 中点：`Midpoint[A, B]`
- 垂线：`PerpendicularLine[point, line]`
- 平行线：`ParallelLine[point, line]`

### viewRange（可选）

**类型：** 对象  
**说明：** 视图范围设置

**字段：**
- `xMin`: x轴最小值（默认 -10）
- `xMax`: x轴最大值（默认 10）
- `yMin`: y轴最小值（默认 -10）
- `yMax`: y轴最大值（默认 10）

**示例：**
```json
{
  "viewRange": {
    "xMin": -5,
    "xMax": 5,
    "yMin": -3,
    "yMax": 7
  }
}
```

**提示：** 根据图形大小调整视图范围，确保图形完整显示且有适当的边距。

## 前端处理流程

### 1. 提取 JSON

```javascript
function extractGGBCommands(content) {
  const jsonMatch = content.match(/```ggb-json\s*([\s\S]*?)```/);
  
  if (jsonMatch) {
    const jsonData = JSON.parse(jsonMatch[1]);
    return {
      success: true,
      commands: jsonData.commands || [],
      viewRange: jsonData.viewRange || null,
      explanation: content.replace(/```ggb-json[\s\S]*?```/g, '').trim()
    };
  }
  
  return { success: false };
}
```

### 2. 创建画板

```javascript
function createGGBApplet(containerId, commands, viewRange) {
  const params = {
    "id": containerId,
    "width": 600,
    "height": 400,
    "showToolBar": false,
    "appName": "graphing"
  };
  
  if (viewRange) {
    params.xmin = viewRange.xMin;
    params.xmax = viewRange.xMax;
    params.ymin = viewRange.yMin;
    params.ymax = viewRange.yMax;
  }
  
  const applet = new GGBApplet(params, true);
  applet.inject(containerId);
  
  // 执行命令
  commands.forEach(cmd => ggbApp.evalCommand(cmd));
  ggbApp.zoomFit();
}
```

### 3. 显示消息

```javascript
// 格式化消息
const formatted = formatMessage(aiResponse);

// 显示文字
contentDiv.innerHTML = formatted.text;

// 如果有 GeoGebra 命令，创建画板
if (formatted.hasGGB) {
  createGGBApplet(containerId, formatted.commands, formatted.viewRange);
}
```

## UI 展示

### 消息气泡结构

```
┌──────────────────────────────────────┐
│ 🤖 AI                                 │
│                                       │
│ 我来为你绘制一个等边三角形...          │
│                                       │
│ ┌──────────────────────────────────┐ │
│ │   [GeoGebra 画板 600x400]        │ │
│ │                                  │ │
│ │         /\                       │ │
│ │        /  \                      │ │
│ │       /____\                     │ │
│ │       A    B                     │ │
│ └──────────────────────────────────┘ │
│                                       │
│ [重新绘制] [复制命令]                 │
└──────────────────────────────────────┘
```

### 操作按钮功能

#### 重新绘制
- 清空画板
- 重新执行所有命令
- 用于调试或刷新

#### 复制命令
- 将所有命令复制到剪贴板
- 格式：每行一个命令
- 方便用户在本地 GeoGebra 中使用

## 错误处理

### 1. JSON 解析失败

如果 JSON 格式错误，回退到旧的文本解析方式：

```javascript
try {
  const jsonData = JSON.parse(jsonString);
} catch (e) {
  console.error('JSON 解析失败:', e);
  return parseOldFormat(content);
}
```

### 2. 命令执行失败

单个命令失败不影响其他命令：

```javascript
commands.forEach(cmd => {
  try {
    ggbApp.evalCommand(cmd);
  } catch (e) {
    console.error('执行命令失败:', cmd, e);
  }
});
```

### 3. 缺少 commands 字段

```javascript
if (!jsonData.commands || jsonData.commands.length === 0) {
  return {
    success: false,
    error: '未找到 GeoGebra 命令'
  };
}
```

## 最佳实践

### 给 AI 的提示

1. **命令顺序很重要**
   - 先定义点，再使用点
   - 先创建基础对象，再创建派生对象

2. **使用有意义的变量名**
   ```json
   {
     "commands": [
       "center = (0, 0)",
       "radius = 3",
       "circle = Circle[center, radius]"
     ]
   }
   ```

3. **设置合适的视图范围**
   - 小图形：范围 -5 到 5
   - 中等图形：范围 -10 到 10
   - 大图形：根据实际坐标调整

4. **提供清晰的解释**
   - 说明绘图思路
   - 解释关键步骤
   - 提示注意事项

### 常见错误

❌ **错误：命令顺序错误**
```json
{
  "commands": [
    "line = Line[A, B]",
    "A = (0, 0)",
    "B = (3, 4)"
  ]
}
```

✅ **正确：先定义点**
```json
{
  "commands": [
    "A = (0, 0)",
    "B = (3, 4)",
    "line = Line[A, B]"
  ]
}
```

❌ **错误：视图范围不合适**
```json
{
  "commands": ["A = (0, 0)", "B = (100, 100)"],
  "viewRange": {"xMin": -10, "xMax": 10, "yMin": -10, "yMax": 10}
}
```

✅ **正确：匹配图形大小**
```json
{
  "commands": ["A = (0, 0)", "B = (100, 100)"],
  "viewRange": {"xMin": -10, "xMax": 110, "yMin": -10, "yMax": 110}
}
```

## 测试用例

### 测试 1：简单图形
```
用户：画一个圆
期望：
- 显示文字解释
- 渲染圆形画板
- 提供操作按钮
```

### 测试 2：复杂图形
```
用户：证明勾股定理
期望：
- 显示详细步骤
- 渲染直角三角形
- 可能多个画板（不同阶段）
```

### 测试 3：错误处理
```
用户：画一个不存在的图形
期望：
- AI 返回错误说明
- 不渲染画板
- 或显示友好的错误信息
```

## 向后兼容

系统仍然支持旧的文本格式：

```
```ggb
A = (0, 0)
B = (3, 4)
Circle[A, B]
```
```

会自动转换为新格式处理。

## 未来扩展

可能的增强方向：

1. **添加元数据**
   ```json
   {
     "commands": [...],
     "metadata": {
       "title": "等边三角形",
       "tags": ["geometry", "triangle"],
       "difficulty": "easy"
     }
   }
   ```

2. **分步动画**
   ```json
   {
     "steps": [
       {"command": "A = (0, 0)", "delay": 0},
       {"command": "B = (4, 0)", "delay": 1000},
       {"command": "C = Rotate[B, 60°, A]", "delay": 2000}
     ]
   }
   ```

3. **交互式参数**
   ```json
   {
     "commands": [...],
     "parameters": {
       "sideLength": {"min": 1, "max": 10, "default": 4}
     }
   }
   ```

---

**总结：** JSON 格式让 GeoGebra 命令的传递更可靠、更结构化，为用户提供了更好的可视化体验。
