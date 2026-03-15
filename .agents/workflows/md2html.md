---
description: 将 Markdown 教程批量转换为 HTML 网页（阶段二：脚本自动化）
---

# /md2html — Markdown 批量转 HTML

将已生成的 `.md` 教程文件批量转换为可在浏览器中直接运行的 `.html` 单文件。

## 输入格式

```
/md2html <目标路径>
```

**示例：**
- `/md2html 02` — 转换第 02 章目录下所有 .md 文件
- `/md2html all` — 转换整个 text 目录下所有 .md 文件
- `/md2html d:\JavaScript\text\02\005_Values_and_Variables.md` — 转换单个文件

## 执行步骤

// turbo-all

1. 解析用户输入，确定转换模式和目标路径

2. 如果用户输入章节号（如 `02`），拼接为 `d:\JavaScript\text\{章节号}`

3. 执行转换脚本：

   **单个章节：**
   ```bash
   node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\md-to-html.js "d:\JavaScript\text\{章节号}" --batch
   ```

   **全量转换：**
   ```bash
   node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\md-to-html.js "d:\JavaScript\text" --all
   ```

   **单个文件：**
   ```bash
   node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\md-to-html.js "<文件路径>"
   ```

4. 确认脚本输出无报错，汇报转换结果

5. 脚本在完成批量转换后，会**自动扫描**并生成/更新 `d:\\JavaScript\\text\\index.md` 主索引文件，添加所有章节的新教程链接。

## 说明

- 此步骤**无需 LLM 参与内容生成**，纯脚本执行
- 脚本自动完成：Markdown 解析 → 自定义组件转换 → CSS/JS 模板注入 → 侧边栏目录生成 → 首页索引生成
- 输出的 `.html` 与 `.md` 同名同目录
