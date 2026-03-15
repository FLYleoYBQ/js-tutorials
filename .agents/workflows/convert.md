---
description: 将 SRT 字幕文件转换为 Markdown 教程（阶段一：LLM 内容生成）
---

# /convert — 字幕转 Markdown 教程

将指定章节的 `.srt` 字幕文件转换为结构化的中文 Markdown 教程。

## 输入格式

```
/convert <章节号或文件夹路径> [起始序号] [结束序号]
```

**示例：**
- `/convert 02` — 转换第 02 章全部字幕
- `/convert 09 012 018` — 只转换第 09 章的 012~018 号文件
- `/convert d:\JavaScript\05` — 指定完整路径

## 执行步骤

// turbo-all

1. 触发 `subtitle-to-tutorial` 技能（读取 `SKILL.md`）

2. 确定目标路径：如果用户只给了章节号（如 `02`），拼接为 `d:\JavaScript\{章节号}\`

3. 批量解析字幕，列出所有待转换文件：
   ```bash
   node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\parse_srt.js "<文件夹路径>" --batch
   ```
   
4. 如果用户指定了起始/结束序号，只处理该范围内的文件

5. 读取提示词模板：`d:\JavaScript\.agents\skills\subtitle-to-tutorial\resources\prompt_template.md`

6. 对每个 `.srt` 文件，按以下流程处理：
   a. 运行 `parse_srt.js` 获取干净文本
   b. 将模板占位符替换为实际值（`{{FILENAME}}`、`{{SECTION}}`、`{{SUBTITLE_TEXT}}`、`{{IS_LAST_LESSON}}`）
   c. 生成**纯 Markdown 教程**（严格遵循 prompt_template.md 的格式和 13 项完整性清单）
   d. 保存到 `d:\JavaScript\text\{章节号}\{序号}_{课题名}.md`
   e. 报告进度：`[3/24] ✅ 003_xxx.md`

7. 全部完成后，提示用户执行 `/md2html` 批量转换为 HTML

## 关键约束

- **输出纯 Markdown**，严禁输出 HTML（`<details>` 除外）
- 可运行代码用 ` ```js {runnable} {title="文件名.js"} ` 标记
- Quiz 用 `:::quiz {correct="X"}` 语法
- 代码填空用 `:::fill-blank` 语法
- 代码对比用 `:::code-comparison` 语法
- 每篇教程必须对照「输出完整性强制清单」13 项逐项核验
