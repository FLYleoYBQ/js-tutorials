# 🤖 Agent Context Handoff (给新接手 AI 的上下文)

> **TO THE NEW ASSISTANT:** 你接手了一个正在进行中的任务。请仔细阅读以下上下文，继承前置规则与进度，然后无缝继续。

## 🎯 当前终极目标 (Mission)

用户正在学习 **Jonas Schmedtmann 的 The Complete JavaScript Course**（Udemy 课程，20 章）。项目的核心是一个 **字幕转教程的自动化工具链**（Skill: `subtitle-to-tutorial`），能将 `.srt` 英文字幕文件转换为高质量的中文教程。

**当前正在进行的核心任务**：将教程输出格式从 **Markdown (.md)** 升级为 **交互式 HTML (.html)**，让学习体验更有趣、更沉浸。

## ✅ 已完成节点 (Accomplished)

1. **SKILL.md 文件夹自动创建功能已更新**
   - 教程输出路径从 `text/` 平铺改为按章节自动创建子文件夹：`text/{章节号}/`
   - 文件命名从 `{章节号}_{序号}_{课题名}.md` 改为 `text/{章节号}/{序号}_{课题名}.md`
   - 索引链接、防覆盖机制、路径约定已同步更新

2. **HTML 教程模板设计方案已获批准**
   - 设计方案在 `implementation_plan.md`（位于 Antigravity brain 目录）
   - 核心方案：**单文件 HTML**，内嵌所有 CSS + JS + 内容
   - 外部依赖：Prism.js（代码高亮）、Mermaid.js（图表渲染）、Google Fonts（字体）通过 CDN 加载
   - 功能模块：暗色主题、可运行代码、Quiz 即时反馈、代码填空检查、折叠展开动画、响应式布局、进度追踪

## 🚧 正在进行与中断点 (WIP & Interrupted At)

**中断在：构建 HTML 模板 Demo 文件**

具体来说，以下工作尚未开始：

1. **❌ 创建 HTML 模板文件**：`d:\JavaScript\.agents\skills\subtitle-to-tutorial\resources\html_template.html`
   - 需要包含：暗色主题 CSS、Prism.js 代码高亮、Mermaid 图表渲染、可运行代码编辑器、Quiz 交互组件、代码填空验证、折叠/展开动画、响应式布局
   - 建议用现有的 `02_015_Taking_Decisions_if_else_Statements.md` 的内容作为 demo 数据填充

2. **❌ 更新 `prompt_template.md`**：将输出格式从 Markdown 改为 HTML
   - 当前文件路径：`d:\JavaScript\.agents\skills\subtitle-to-tutorial\resources\prompt_template.md`
   - 保留所有现有内容生成规则（知识脉络、执行追踪、Mermaid 图表等），只改输出格式部分

3. **❌ 更新 `SKILL.md`**：工作流中文件扩展名从 `.md` 改为 `.html`
   - 当前文件路径：`d:\JavaScript\.agents\skills\subtitle-to-tutorial\SKILL.md`
   - 命名规范、文件路径约定都要同步改

## ⚠️ 避坑指南与硬性规矩 (Quirks & Rules)

1. **项目没有 Git 仓库**：`d:\JavaScript` 目录下没有 `.git`，不要尝试 git 命令。
2. **字幕文件在 `d:\JavaScript\01` ~ `d:\JavaScript\20`**，教程输出在 `d:\JavaScript\text\`。
3. **Skill 核心文件位置**：
   - `d:\JavaScript\.agents\skills\subtitle-to-tutorial\SKILL.md`（工作流定义）
   - `d:\JavaScript\.agents\skills\subtitle-to-tutorial\resources\prompt_template.md`（AI 提示词模板）
   - `d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\parse_srt.js`（SRT 解析脚本）
4. **HTML 模板设计要点**：
   - 必须是**单文件 HTML**，双击浏览器即开
   - 暗色主题 + 高级排版（反"大厂 AI 味"审美）
   - 动画不超过 200ms
   - 外部依赖仅通过 CDN（Prism.js、Mermaid.js、Google Fonts）
5. **现有 Markdown 教程内容对照**：`d:\JavaScript\text\02_015_Taking_Decisions_if_else_Statements.md` 是最好的参考内容，包含完整的知识点、Mermaid 图、执行追踪、Quiz、代码填空等所有板块。

## ⏭️ 你的第一步任务 (Next Steps for YOU)

1. 阅读本文档后，打开 `d:\JavaScript\text\02_015_Taking_Decisions_if_else_Statements.md` 了解现有教程内容结构
2. **立即开始创建 HTML 模板**（`html_template.html`），用 if/else 教程内容作为 demo 数据
3. 完成后在浏览器中打开验证效果
4. 然后更新 `prompt_template.md` 和 `SKILL.md`
