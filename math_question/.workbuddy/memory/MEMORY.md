# 项目记忆

## 项目类型
数学题库管理系统（HTML + CSS + JS），支持 LaTeX 公式渲染（MathJax）。

## 技术栈
- 前端：原生 HTML/CSS/JS，无框架
- 数学公式：MathJax 3.2.2（CDN）
- 图标：已从 Font Awesome CDN 迁移到内联 SVG（symbol+use 方案）
- 数据存储：JS 变量 (var math_question = {...})

## 已完成的重要改动
- 2026-06-15: Font Awesome → 内联 SVG 迁移完成
  - 移除了 FA CDN 依赖 (all.min.css)
  - 11 个图标全部用 symbol+use 内联：plus, file-export, file-import, print, trash, save, times, edit, eye, eye-slash, lightbulb
  - CSS 添加了 .icon 样式类
  - index.htm 和 math_question.js 中的 FA 引用全部替换
  - browser-python.html 仍有 FA CDN，未处理（独立页面）

## 文件说明
- index.htm: 主页面
- math_question.css: 样式
- math_question.js: 核心逻辑（渲染、增删改查、导入导出）
- question.js: 题目数据
- browser-python.html: 独立的浏览器 Python 工具页面

## Skill 已创建
- font-awesome-to-svg: 位于 ~/.workbuddy/skills/font-awesome-to-svg/
