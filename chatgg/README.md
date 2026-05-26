ChatGGB 重构（中文说明）

概述
----
这是一个针对当前 chatgg 功能的全新简洁实现骨架，放在 `/chatgg` 下。目标是提供聊天与 GeoGebra 图形渲染的基础功能，并保留可扩展的接口以便后续替换 AI 接入和增强解析器。

包含文件
----
- `index.html`：主页面（简单 UI），包含固定画板、聊天区与输入区。
- `style.css`：页面样式。
- `ggbAdapter.js`：最小化的 GeoGebra 适配器，负责加载 `deployggb.js` 并封装常用方法（注入、执行命令、ZoomFit、清空、枚举对象等）。
- `ggbParser.js`：简易解析器，从助手文本/HTML 中提取 GeoGebra 命令（优先 code fence / <pre>）。
- `aiClient.js`：精简的 AI 客户端适配层（当前为本地规则/占位实现，后续可替换为真实后端）。
- `main.js`：UI glue，负责与 AI 客户端交互、将 AI 输出解析为命令并下发到 GeoGebra。

当前实现的功能（已实现）
----
- 页面上方有一个固定 GeoGebra 画板（`#ggb-fixed`），用于集中展示 AI 生成的图形；并支持在消息中按需创建临时画板副本。
- 输入区域可发送文本到简易 AI 客户端，显示 AI 回复文本。
- `ggbParser` 能从 AI 回复中提取命令（支持 fenced code block、`<pre>`、以及简单的行拆分）。
- 抽象的 `GGBAdapter` 暴露 `createApplet`, `executeCommands`, `zoomFit`, `clear`, `listObjects`, `setSize` 等方法，便于后续替换或扩展。

主要问题与观察
----
- 画板渲染时常见问题：被父容器压缩或内部元素带有 transform 缩放，导致只显示工具条或一条横条。
- AI 输出格式多样，命令解析需更鲁棒的策略以避免识别失败。
- GeoGebra 在不同版本或封装下 API 名称不完全一致（如 `repaint` / `setSize` 等），需要兼容层。

重构目标（作为后续开发的需求提示语）
----
目标是建立一套稳健、可维护且易扩展的 ChatGGB：

核心需求：
- 多画板支持：页面中可展示多个 GeoGebra 实例（固定主画板 + 每条消息的可选副本）。
- 稳定命令解析：解析器应支持多种 AI 输出形式（fenced code、`<pre>`、普通文本中的行命令），并输出标准命令数组。
- 渲染策略：优先把命令下发到固定主画板；若用户需要也能在单条消息下创建独立画板副本。
- 统一的 applet 适配层：`ggbAdapter` 应封装常用 API（evalCommand、setSize、ZoomFit、getAllObjectNames、getXcoord/getYcoord、setCoordSystem、repaint）并对不同版本做容错。

UI/UX 要求（建议）
- 画板以卡片形式显示，可收起/展开/最大化；每个画板上提供工具按钮（ZoomFit / Clear / Export）。
- 在消息处显示“图形已在上方画板显示”或“在此消息下创建了画板”的提示，并提供“在新画板打开 / 复制命令 / 反馈给 AI 修改并重试”的交互。

错误处理与调试
----
- 命令执行失败时显示详细错误（命令 + GeoGebra 报错），并提供“一键反馈给 AI 修改并重试”。
- 在 UI 或控制台输出关键调试信息：提取到的命令、Injected applet id、对象列表、计算到的 bbox、setCoordSystem 参数、API 调用失败信息等。

接口与数据格式建议
----
- AI -> 前端：建议 AI 在回复内提供明确的 fenced code block（```）包裹 GeoGebra 命令，作为首选解析来源。
- 前端内部命令形态：[{cmd: "A=(0,0)", raw: "A=(0,0)", line:1}]。
- ggbAdapter 应提供：
	- `createApplet(containerId, options) -> Promise<applet>`
	- `executeCommands(applet, commands[]) -> {errors:[], success}`
	- `clear(applet)`, `zoomFit(applet)`, `setView(applet,bbox)`, `listObjects(applet)`。

实施阶段（建议分步）
----
1. 规格与接口定义：明确 `ggbAdapter` 与 `ggbParser` 的 API 及数据格式。
2. 实现 `ggbAdapter`：注入库、处理 appletOnLoad、兼容常见 API 名称、返回统一错误结构。
3. 强化 `ggbParser`：单元测试覆盖常见 AI 输出样式、支持更多分隔与实体解码。
4. UI 组件化：实现 `FixedGgbPanel`（单例）与 `MessageGgbCard`（多副本），并提供工具条操作。
5. 集成聊天流：将 AI 回复显示、提取命令、在主画板/副本上渲染，并提供重试/反馈操作。
6. 测试与兼容性验证：在主流浏览器上验证注入、命令执行、视图调整（ZoomFit/setCoordSystem）等。

交付物建议
----
- 新模块： `chatgg/ggbAdapter.js`, `chatgg/ggbParser.js`, `chatgg/aiClient.js`。
- 主逻辑与 UI：`chatgg/main.js`、`chatgg/index.html`、`chatgg/style.css`。
- 文档：`chatgg/README.md`（即本文件）。

后续我可以：
- 将 `ggbParser` 与 `ggbAdapter` 进一步增强为生产级模块；或
- 直接将本新 UI 替换为站点默认入口并做一次完整集成测试（包含真实 AI 后端接入）。

请告诉我你想先做哪一项（增强解析器 / 完整替换 / 接入真实 AI），我会继续实现下一步。 
