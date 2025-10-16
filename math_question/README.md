# 铅笔题库
一个题库应用系统，主要功能是使用AI拍照解题，尤其是数学题调用AI和 GeoGebra 画出清晰准确的图形，最后把题目分门别类保存起来。
由于 **题库** 的英文叫 **question bank**，取首字母 QB 想到中文名字叫 **铅笔**。

想使用一个前端框架来把现有的 math_question 系统化一下，先选了 Svelte 但是看了半天没看懂。回来用 VUE 再试试。


# 参考
[学习 GeoGebra 经典应用-官方教程] (https://www.geogebra.org/m/cxqnngwx)

[GeoGebra官方手册] (https://geogebra.github.io/docs/manual/en/Predefined_Functions_and_Operators?redirect=zh-CN)

[ggb优化版本](https://kz16.top/ggb/ggbpptReadMe.html)
原来还可以直接把GGB 画图文件嵌入 markdown 以及 HTML ，研究一下，后续可以替代图形图片。


```
A = (1, 2)
B = (3, 4)
f = x^0.2
```
## 开发提示语
之所以在对话中每段解析出来的命令下面都放执行全部命令控件，就是因为对话是多轮的，可能返回 多组命令。
现在已经 把多行文本框默认隐藏了。不如把功能前进到不要单个的多行文本框了。而是响应内容中用来显示命令的HTML代码从pre+code直接改成textarea吧。这样点击每个textarea下面的执行控件就是执行里面的命令，也不会丢失 \n符了。也不用编辑命令控件和相关代码了，textarea直接就是可以编辑的。

<div id="chat-container" class="chat-container"></div>
这块其实是要固定高度，即对话多了以后，在这个块的右侧显示滚动条。底下的输入框仍然保持在靠页面底边对齐不动。当然输入框一开始也要靠页面底边对齐，这块现在还不对。

如果选择上传图片，不要用alert()提示图片选好了，而是在用户输入框上面显示一个图片预览。

把设置进一步简化吧。不要根据选择当前的模型切换界面了，简单放到一个统一界面里，系统提示语统一成一份。选择当前模型放在前前面，然后是3个模型的配置项目，顺序排列下来即可 。
第1个是DeepSeek，只填写API密钥。
第2个是通义千问，只填写API密钥。
第3个是Azure OpenAI,填写API密钥、访问端点、和模型名称。


现在调用 Azure OpenAI和 Qwen 对图片的处理方法应该再整合到一起，处理逻辑应保持一致，提取出共用的方法放到 AiBase类中，比如存取临时图片需要变量应该放在AiBase类中，而不是 GgbManage类中。图片base64编码的方法应该统一放在 AiBase类中。Qwen 的callAPI() 方法应该统一成一个，像Azure OpenAI那样图片参数为可选的。

## 测试用提示语

* 支持你的AI模型是什么？
* 画一个直角三角形
* 请为此题画图：在三角形ABC 中,AB 边的垂直平分线交 AB 于点 D,交 BC 于点 E.AC 边的垂直平分线交 AC 于点 M,交 BC 于点 N. 角BAC=96度，求 角EAN度数。


# Pyplot
GeoGebra 画的图效果实在不灵，多数情况都画得差太多。尝试用 Python 的 Pyplot 试试。

## 使用 pyodide 在浏览器端集成 Python 运行环境
使用对话生成用于 Pyplot 的 Python 代码，然后运行并画出图形。


# 自然语言生成Pyplot代码系统提示语

## 概述
你是一个专业的数学图形代码生成助手，能够将自然语言描述的数学题目或图形需求转换为可直接运行的Python代码。你的核心任务是分析数学问题中涉及的函数、方程、几何图形或数据关系，生成使用matplotlib.pyplot绘制相应图形的完整代码，帮助用户通过可视化理解数学概念。

## 过程
1. 首先解析输入的数学题目，识别需要绘制的核心元素（函数、方程、几何图形、数据点等）
2. 确定图形类型（线图、散点图、直方图、几何图形等）及必要参数（坐标轴范围、标题、标签等）
3. 设计合理的可视化方案，确保数学特征清晰可见
4. 生成完整、独立、可直接运行的Python代码
5. 检查代码的正确性和可读性，确保符合数学逻辑

## 依赖
生成的代码必须使用以下库，无需引入其他绘图库：
- import matplotlib.pyplot as plt
- import numpy as np
- import math（如需要）

代码中应包含所有必要的导入语句，无需用户额外导入。

## 控制
1. 代码必须是完整可运行的，不依赖任何外部数据文件
2. 代码应包含适当的注释，解释关键步骤和数学意义
3. 确保图形具有必要的元素：标题、坐标轴标签、网格（如适用）、图例（如有多个元素）
4. 设置合适的坐标轴范围，确保关键数学特征清晰可见
5. 代码风格应简洁明了，变量命名应具有数学意义
6. 最后必须包含plt.show()语句以显示图形
7. 不输出任何解释性文字，只返回可运行的Python代码
8. 绘制几何图形时的额外要求：
	* 画点时不需要画出圆点
	* 表示点的大写字母使用斜体Roman体
	* 垂足标记使用小直角，且画在直角内部
	* 图形上不带任何图例和说明文字，尤其是不出现中文，不画坐标系
	* 表示点名称、长度或度数的标记尽量贴近点、线段和角，但避免重叠



## 改造计划：从 GeoGebra 到基于 Pyodide 的 Python 绘图

基于我对项目文件的分析，我为您制定了将 ChatPyplot.htm 从 GeoGebra 版本改造成基于 Pyodide 的 Python 绘图版本的详细计划：


### 1. 核心结构变化

**文件重用：**
- 保留 [ChatPyplot.htm](file:///c:/Study/GitHub/xfsnow.github.io/math_question/ChatPyplot.htm) 作为主文件，但需要完全重构
- 移除 GeoGebra 依赖，替换为 Pyodide 实现

### 2. HTML 结构修改

**移除 GeoGebra 相关元素：**
- 移除 GeoGebra 应用容器 (`#ggb-element`)
- 移除 GeoGebra 相关 CSS 链接
- 移除 GeoGebra JavaScript 库引用

**添加 Pyodide 元素：**
- 添加 Pyodide 脚本引用（通过 CDN）
- 创建用于显示 matplotlib 图形的画布或 div 容器
- 保持聊天界面结构但适配 Python 代码输出

### 3. UI/UX 变化

**界面重新设计：**
- 将标题 "和AI聊聊天，用GeoGebra画图形" 替换为 "和AI聊聊天，用Python画图形"
- 修改设置面板以专注于 Python 代码生成
- 更新系统提示语以专注于 Python matplotlib 而不是 GeoGebra 命令
- 将 GeoGebra 命令执行按钮替换为 Python 代码执行功能

### 4. 后端逻辑转换

**替换 AI 响应处理：**
- 从提取 GeoGebra 命令改为提取 Python 代码
- 修改代码格式化以处理 Python 代码块而不是 GeoGebra 块
- 更新执行机制以通过 Pyodide 运行 Python 代码而不是执行 GeoGebra 命令

**Pyodide 集成：**
- 在页面加载时初始化 Pyodide
- 安装所需包（matplotlib, numpy）
- 创建执行 Python 代码并显示图形的函数
- 处理输出显示（图形和文本输出）

### 5. AI 模型配置更新

**系统提示语修改：**
- 重写系统提示语以指导 AI 生成 Python matplotlib 代码
- 包含 Python 代码示例和最佳实践
- 指定 Python 代码块格式（```python ... ```）

**响应处理变更：**
- 提取 Python 代码块而不是 GeoGebra 块
- 格式化代码以在代码编辑器中显示
- 添加"运行"按钮来执行 Python 代码

### 6. 代码执行工作流程

**新的执行流程：**
1. 用户向 AI 发送消息
2. AI 响应包含解释和 Python 代码块
3. 提取 Python 代码并在编辑器区域显示
4. 用户可以编辑代码（如果需要）
5. 用户点击"运行"通过 Pyodide 执行代码
6. 在输出区域渲染图形

### 7. 技术实现步骤

1. **HTML 结构更新：**
   - 将 GeoGebra 应用替换为图形输出区域
   - 添加 Python 代码编辑器区域
   - 更新标题和标签

2. **CSS 样式：**
   - 移除 GeoGebra 相关样式
   - 添加代码编辑器和图形显示的样式
   - 保持聊天界面样式

3. **JavaScript 重写：**
   - 移除 GeoGebra 初始化代码
   - 添加 Pyodide 初始化
   - 实现 Python 代码提取和执行
   - 更新消息格式化以处理 Python 代码块
   - 添加代码执行的事件处理程序

4. **系统提示更新：**
   - 完全重写 Python/matplotlib 上下文
   - 包含 Python 代码示例
   - 指定期望的输出格式

5. **UI 组件：**
   - 将 GeoGebra 执行按钮替换为 Python 运行按钮
   - 添加适当的 Python 代码编辑器
   - 创建图形和文本结果的输出区域

### 8. 要实现的关键功能

- **Pyodide 集成：** 加载 Pyodide 和所需包（matplotlib, numpy）
- **Python 代码执行：** 执行 Python 代码并显示结果
- **图形渲染：** 在浏览器中显示 matplotlib 图形
- **代码编辑器：** 允许用户查看和编辑生成的 Python 代码
- **聊天界面：** 保持与 AI 的对话流程
- **错误处理：** 正确显示 Python 执行错误

### 9. 测试注意事项

- 验证 Pyodide 是否正确加载
- 测试 Python 代码执行和图形渲染
- 确保聊天界面与新响应格式配合使用
- 验证无效 Python 代码的错误处理
- 检查跨设备的响应式设计

这个改造将创建一个功能强大的基于浏览器的 Python 绘图工具，它使用 AI 生成代码并通过 Pyodide 在浏览器中直接执行，无需后端服务器。

要想要画图可以支持中文，需要在 AI 响应的内容中添加中文字体，并加载中文字体。
```python
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.font_manager import FontProperties
from pyodide.http import pyfetch

# 1. 加载中文字体文件
async def load_font():
    font_url = "pyodide/NotoSansSC-Regular.otf "
    response = await pyfetch(font_url)
    if response.status == 200:
        return await response.bytes()
    else:
        raise Exception(f"字体加载失败，状态码: {response.status}")

# 2. 写入虚拟文件系统
font_data = await load_font()
font_path = '/tmp/NotoSansSC-Regular.otf '
with open(font_path, 'wb') as f:
    f.write(font_data)

# 3. 初始化字体属性（关键：后续直接传递给文本对象）
chinese_font = FontProperties(fname=font_path, size=14)  # 明确指定字体路径和大小

# 创建图形
fig, ax = plt.subplots(figsize=(6, 6))

# 关键修正：标题指定字体属性
plt.title("测试标题", fontproperties=chinese_font)

plt.xlabel("X轴", fontproperties=chinese_font)
plt.ylabel("Y轴", fontproperties=chinese_font)
plt.show()
```

这一版终于可以正常显示中文了。