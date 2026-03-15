# 🤖 Agent Context Handoff (给新接手 AI 的上下文)

> **TO THE NEW ASSISTANT:** 你接手了一个正在进行中的任务。请仔细阅读以下上下文，继承前置规则与进度，然后无缝继续。

## 🎯 当前终极目标 (Mission)

用户正在将 Jonas Schmedtmann 的 JavaScript 课程字幕（`.srt` 文件）批量转换为**中文 Markdown 教程**，存储在 `d:\JavaScript\text2\` 目录下，按章节（02~07 等）分文件夹组织。

**两阶段工作流：**
1. **阶段一（LLM 生成）**：SRT → Markdown（使用 `/convert` 工作流 + `subtitle-to-tutorial` 技能）
2. **阶段二（脚本自动化）**：Markdown → HTML（使用 `/md2html` 工作流，尚未全面执行）

## ✅ 已完成节点 (Accomplished)

### text2/ 目录下已完成的 Markdown 教程：

| 章节 | 已完成文件数 | 状态 |
|------|-------------|------|
| 02 | 24 篇 | ✅ 全部完成 |
| 03 | 20 篇 | ✅ 全部完成 |
| 04 | 1 篇 (001) | 🚧 部分完成 |
| 05 | 10 篇 | ✅ 全部完成 |
| 06 | 3 篇 (001, 002, 003) | 🚧 部分完成 |
| 07 | 5 篇 (001, 003, 004, 005, 006) | 🚧 部分完成 |

### 工具链已建立：
- `parse_srt.js`：字幕解析脚本，支持单文件和 `--batch` 模式
- `md-to-html.js`：Markdown 转 HTML 脚本（新建未提交）
- `prompt_template.md`：LLM 提示词模板（已修改未提交），含 13 项完整性强制清单
- `/convert` 和 `/md2html` 工作流文件（新建未提交）

## 🚧 正在进行与中断点 (WIP & Interrupted At)

### ❗ 中断于：06/004 Basic Styling with CSS 的 Markdown 教程生成

- **文件**：`d:\JavaScript\06\004 Basic Styling with CSS.en.srt`
- **状态**：字幕已解析完毕（纯文本已获取），但 **Markdown 教程尚未生成和写入**
- **输出目标**：`d:\JavaScript\text2\06\004_Basic_Styling_with_CSS.md`
- **字幕内容摘要**：讲解 CSS 基础——内联样式 vs 外部样式表、选择器（元素、类、ID）、font-family/font-size 继承、border 简写属性、颜色（命名色/RGB/十六进制）

### 06 章节全部 SRT 文件清单（5 个）：
1. ✅ `001 Section Intro.en.srt`
2. ✅ `002 Basic HTML Structure and Elements.en.srt`
3. ✅ `003 Attributes, Classes and IDs.en.srt`
4. ❌ `004 Basic Styling with CSS.en.srt` ← **当前中断点**
5. ❌ `005 Introduction to the CSS Box Model.en.srt`

### 未提交的 Git 变更：
- modified: `.agents/context/handoff.md`
- modified: `.agents/skills/subtitle-to-tutorial/SKILL.md`
- modified: `.agents/skills/subtitle-to-tutorial/resources/html_template.html`
- modified: `.agents/skills/subtitle-to-tutorial/resources/prompt_template.md`
- new: `.agents/skills/subtitle-to-tutorial/scripts/md-to-html.js`
- new: `.agents/workflows/convert.md`
- new: `.agents/workflows/md2html.md`
- new: `text2/` 目录下所有教程文件

## ⚠️ 避坑指南与硬性规矩 (Quirks & Rules)

1. **输出路径是 `text2/` 而不是 `text/`**：用户已建立 `text2/` 作为新的 Markdown 教程输出目录（`text/` 是旧版 HTML 教程目录）。
2. **严格遵循 `/convert` 工作流**：所有步骤标记为 `// turbo-all`，可自动执行。
3. **必须遵循 prompt_template.md 的 13 项完整性清单**：每篇教程缺一不可。
4. **不是最后一课不要生成章节挑战**：06/004 不是最后一课（005 才是）。
5. **文件命名规范**：`{序号}_{课题名}.md`，空格替换为下划线，去掉 `.en.srt` 后缀。
6. **06 章主题是 HTML & CSS 基础**（不是 JavaScript），教程内容应以 CSS 为主。

## ⏭️ 你的第一步任务 (Next Steps for YOU)

1. **立即生成** `d:\JavaScript\text2\06\004_Basic_Styling_with_CSS.md` 教程：
   - 运行 `node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\parse_srt.js "d:\JavaScript\06\004 Basic Styling with CSS.en.srt"` 获取字幕文本
   - 读取 `d:\JavaScript\.agents\skills\subtitle-to-tutorial\resources\prompt_template.md` 模板
   - 按模板生成中文 Markdown 教程并写入文件
   - 占位符替换：`{{FILENAME}}` = `004 Basic Styling with CSS.en.srt`，`{{SECTION}}` = `06`，`{{IS_LAST_LESSON}}` = `否`

2. **然后继续** 06/005（最后一课），完成第 06 章全部转换。

3. 用户可能会继续要求转换其他章节，按同样流程处理即可。
