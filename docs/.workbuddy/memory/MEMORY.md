# GeoGebra 文档汉化项目 - 长期笔记

## 项目结构
- `D:\Study\ggb\docs\manual\en\` — 英文原文（688 个 HTML）
- `D:\Study\ggb\docs\manual\zh\` — 中文翻译
- `D:\Study\ggb\docs\manual\zh\terminology.md` — 术语表
- `D:\Study\ggb\docs\_\scripts\translate_html.py` — 翻译脚本（GLM API）
- 图片不复制到 zh，zh 中 HTML 引用 en/_images 下的图片

## 关键约定
- 本地开发环境测试域名：`http://ggb.sp.org/docs/manual/zh/`
- 图片路径规则：zh 子目录 depth=2 → `../../en/_images/`，depth=3 → `../../../en/_images/`
- 翻译 API 均通过环境变量传入 Key，不再明文写在代码中：
  - Gemini 代理：`GEMINI_API_KEY`（本地代理可能不需要）、`GEMINI_BASE_URL`（默认 http://localhost:8081/v1）
  - 模型优先级：gemini-3.5-flash > gemini-3.5-flash-thinking > gemini-3.1-pro > gemini-auto > gemini-3.5-flash-thinking-lite > gemini-flash-lite
  - 阿里千问：`QWEN_API_KEY`（必须）、`QWEN_BASE_URL`（默认 DashScope）、`QWEN_MODEL`（默认 qwen3.7-max）
  - 智谱 GLM：`GLM_API_KEY` 或 `ZHIPUAI_API_KEY`（必须），通过 `--api glm` 切换
- 保留英文内容：语言名、按键名、技术署名、CSS/JS、SVG 路径
- 保留英文内容：GeoGebra 命令名（如 `Circle[A, r]`）、LaTeX/MathJax
- 保留英文内容：目录页 `<a class="xref page">` 链接文字中的命令名保持英文（如 Circle、Ellipse），不翻译为中文
- 版本菜单：已简化为"中文"纯文本 + "English"链接（指向对应英文页面），不再显示多语言列表
