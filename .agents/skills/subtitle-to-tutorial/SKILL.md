---
name: subtitle-to-tutorial
description: 读取课程字幕文件（.srt），应用 Jonas 风格教学特性（DRY代码重构、代码挑战沙盒、底层原理深度图文解剖、MDN文档附魔），解析并转换为结构化的中文教程。支持两阶段工作流：先生成 Markdown，再批量转为 HTML。
---

# 字幕转教程 Skill (subtitle-to-tutorial)

## 触发场景

当用户要求以下任务时，**必须**触发本 Skill：
- 将 `.srt` 字幕文件转换为教程（单文件或整个文件夹）
- 批量生成课程笔记/教程
- 处理 `d:\JavaScript` 下的字幕文件
- 用户说"转换 XX"并指向一个章节号或文件夹路径
- 将已有 `.md` 教程转换为 HTML（仅需步骤 5）

## 两阶段工作流概述

```
阶段一（LLM 生成）：SRT → Markdown    ← AI 专注内容质量
阶段二（脚本转换）：Markdown → HTML    ← 脚本自动化，零成本
```

## 工作流程（文件夹级别转换 — 默认模式）

用户输入示例：
- "转换 02 文件夹"
- "把第 3 章转成教程"
- "转换 d:\JavaScript\05"

### 步骤 1：确定目标文件夹

根据用户输入解析目标路径。如果用户只给了章节号（如 `02`、`第3章`），自动拼接为 `d:\JavaScript\{章节号}\`。

### 步骤 2：批量解析字幕

运行解析脚本，一次性提取文件夹内所有 `.srt` 文件的纯文本：

```bash
node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\parse_srt.js "<文件夹路径>" --batch
```

脚本会按文件名序号排序，输出每个文件的合并断句纯文本。

### 步骤 3：逐文件生成 Markdown 教程（阶段一）

对文件夹中的 **每个 `.srt` 文件**，按以下子流程处理：

1. **解析字幕文件**：运行 `parse_srt.js` 获取干净文本
   ```bash
   node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\parse_srt.js "<单个srt文件路径>"
   ```
2. **读取提示词模板**：加载 `resources/prompt_template.md`
3. **AI 生成教程**：将模板中的占位符替换为实际内容后，生成**中文 Markdown 教程**
   - `{{FILENAME}}` → 原始文件名
   - `{{SECTION}}` → 章节号
   - `{{SUBTITLE_TEXT}}` → 解析后的纯文本
   - `{{IS_LAST_LESSON}}` → 是否为章节最后一课
4. **保存 Markdown 文件**：写入 `d:\JavaScript\text\{章节号}\{序号}_{课题名}.md`
   - **自动创建文件夹**：保存前检查目录是否存在
   - **防覆盖**：如果目标文件已存在，自动追加版本号 `_v2`、`_v3`...
5. **报告进度**：`[3/24] ✅ 003 A Brief Introduction to JavaScript → 02/003_A_Brief_Introduction_to_JavaScript.md`

**关键要求（阶段一）：**
- 输出**纯 Markdown**，严禁输出 HTML 标签（`<details>` 除外，Markdown 原生支持）
- 可运行代码块使用 ` ```js {runnable} {title="文件名.js"} ` 标记
- Quiz 使用 `:::quiz {correct="B"}` 自定义语法
- 代码填空使用 `:::fill-blank` 自定义语法
- 代码对比使用 `:::code-comparison` 自定义语法
- 英文口语讲解 → 中文书面 Markdown
- 过滤口语填充词（"okay", "alright", "so", "right" 等）
- 保留讲师的教学逻辑和知识点递进关系
- **上下文隔离**：每个文件转换完成后，必须清空前一个文件的生成上下文，确保每次生成都是"干净"的。避免长上下文导致生成质量下降或前后文件内容相互干扰

### 步骤 4：批量转换为 HTML（阶段二）

所有 Markdown 生成完成后，运行转换脚本：

```bash
# 转换单个章节目录
node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\md-to-html.js "d:\JavaScript\text\{章节号}" --batch

# 或转换整个 text 目录
node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\md-to-html.js "d:\JavaScript\text" --all
```

此步骤**无需 LLM 参与**，纯脚本执行，自动完成：
- Markdown 内容解析
- 自定义组件转换（:::quiz → quiz-card、:::fill-blank → 填空组件等）
- CSS/JS 模板注入（从 `html_template.html` 复用）
- 侧边栏目录自动生成
- 输出同名 `.html` 文件

### 步骤 5：生成章节目录索引

全部文件处理完成后，在 `d:\JavaScript\text\` 下生成或更新 `index.md`：

```markdown
# JavaScript 课程教程索引

## 第 02 章：JavaScript 基础
1. <a href="./02/002_Hello_World.html">Hello World</a>
2. <a href="./02/003_A_Brief_Introduction_to_JavaScript.html">A Brief Introduction to JavaScript</a>
...
```

---

## 单文件模式

如果用户只需转换单个文件：

```bash
# 步骤 1: 解析字幕
node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\parse_srt.js "d:\JavaScript\02\002 Hello World!.en.srt"

# 步骤 2: AI 生成 Markdown（使用 prompt_template.md）

# 步骤 3: 转换为 HTML
node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\md-to-html.js "d:\JavaScript\text\02\002_Hello_World.md"
```

---

## 仅 Markdown → HTML 模式

如果用户已有 Markdown 教程文件，只需执行阶段二：

```bash
# 单文件
node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\md-to-html.js "path/to/tutorial.md"

# 批量
node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\md-to-html.js "path/to/chapter_dir" --batch
```

---

## Jonas 专家级教学特色 (Jonas Signature Features)

本技能深度契合 Jonas Schmedtmann 的教学模型，在将字幕解析为教程时，要求**强制**实施以下学习体验增强：

1. **🏆 代码挑战考场模式 (Coding Challenge)**：
   - 凡字幕标题包含 "Challenge" 时，严格提取视频中的 `Tasks` (任务清单) 和 `Test Data` (测试数据集) 单列。
   - 正文首发提供带提示注释的空白代码块（标记为 `{runnable}`），**严禁直接剧透答案代码**。
   - Jonas 的标准解法与"如何思考"推演过程，必须包裹在 `<details summary="💡 Jonas 官方解法拆解">` 折叠面板中。
2. **🔄 先跑通后重构 (DRY 原则演进展现)**：
   - 遇到代码优化重构场景时，**必须**使用 `:::code-comparison` 呈现双栏对比。
3. **🧠 底层原理图解 (Behind the Scenes)**：
   - 涉及 JavaScript 运行底层（调用栈、执行上下文、Event Loop 等），必定通过 Mermaid 绘制可视化图表。
   - 涉及变量作用域查找机制，务必绘制**作用域链 (Scope Chain)** 寻址图。
4. **📚 MDN 官方文档超链接靶向附魔**：
   - 词汇速查表最后一列强制新增「📚 官方文档溯源」MDN 链接。

---

## 自定义 Markdown 组件语法参考

### 可运行代码块
````markdown
```js {runnable} {title="index.js"}
const x = 10;
console.log(x);
```
````

### Quiz 组件
```markdown
:::quiz {correct="B"}
**1. 问题内容？**
- A) 选项一
- B) 选项二
- C) 选项三

> **解析**：解释内容
:::
```

### 代码填空
```markdown
:::fill-blank
const result = ___答案___;
___if___ (result > 0) { ... }
:::
```

### 代码对比（DRY 重构）
````markdown
:::code-comparison
```js {title="🚨 初版冗余写法 (The Naive Way)"}
// naive code
```
```js {title="✨ DRY 重构写法 (The Refactored Way)"}
// refactored code
```
:::
````

---

## 教程文件自动命名与目录规范

**从原始 `.srt` 文件名自动提取**，规则如下：

1. 取文件所在文件夹名（两位数字）作为 `{章节号}`
2. 取文件名开头数字作为 `{序号}`（保留三位，如 `002`）
3. 去掉序号和 `.en.srt` 后缀，空格替换为 `_`，得到 `{课题名}`
4. **自动创建章节文件夹**：`d:\JavaScript\text\{章节号}\`
5. **阶段一输出**：`d:\JavaScript\text\{章节号}\{序号}_{课题名}.md`
6. **阶段二输出**：`d:\JavaScript\text\{章节号}\{序号}_{课题名}.html`

**自动命名示例：**

| 原始文件 | Markdown 输出 | HTML 输出 |
|---------|---------------|-----------|
| `02/002 Hello World!.en.srt` | `text/02/002_Hello_World.md` | `text/02/002_Hello_World.html` |
| `03/003 Functions.en.srt` | `text/03/003_Functions.md` | `text/03/003_Functions.html` |

**防覆盖机制：**
- 保存前检查目标路径下是否已有同名文件
- 若已存在，自动追加版本号：`_v2`、`_v3`...

## 质量检查清单

生成每个 Markdown 教程后，必须验证：
- [ ] 所有代码块使用 ` ```js ` 语法高亮
- [ ] 可运行代码使用 `{runnable}` 标记
- [ ] 代码示例可独立运行
- [ ] 抽象内容用 Mermaid 图解
- [ ] 无英文口语残留
- [ ] 知识点有清晰的递进逻辑
- [ ] 中文表述通顺，术语准确
- [ ] Quiz 使用 `:::quiz` 语法
- [ ] 代码填空使用 `:::fill-blank` 语法
- [ ] 对照「输出完整性强制清单」13 项全部覆盖

## 文件路径约定

| 项目 | 路径 |
|------|------|
| 字幕源目录 | `d:\JavaScript\01` ~ `d:\JavaScript\20` |
| 教程输出根目录 | `d:\JavaScript\text\` |
| 章节教程目录 | `d:\JavaScript\text\{章节号}\`（如 `text\01\`、`text\02\`） |
| 目录索引 | `d:\JavaScript\text\index.md` |
| SRT 解析脚本 | `d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\parse_srt.js` |
| MD→HTML 转换脚本 | `d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\md-to-html.js` |
| 提示词模板 | `d:\JavaScript\.agents\skills\subtitle-to-tutorial\resources\prompt_template.md` |
| HTML 壳子模板 | `d:\JavaScript\.agents\skills\subtitle-to-tutorial\resources\html_template.html` |
