---
name: subtitle-to-tutorial
description: 读取课程字幕文件（.srt），应用 Jonas 风格教学特性（DRY代码重构、代码挑战沙盒、底层原理深度图文解剖、MDN文档附魔），解析并转换为结构化的中文教程。
---

# 字幕转教程 Skill (subtitle-to-tutorial)

## 触发场景

当用户要求以下任务时，**必须**触发本 Skill：
- 将 `.srt` 字幕文件转换为教程（单文件或整个文件夹）
- 批量生成课程笔记/教程
- 处理 `d:\JavaScript` 下的字幕文件
- 用户说"转换 XX"并指向一个章节号或文件夹路径

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

### 步骤 3：逐文件生成教程

对文件夹中的 **每个 `.srt` 文件**，按以下子流程处理：

1. **解析字幕文件**：运行 `parse_srt.js` 获取干净文本
   ```bash
   node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\parse_srt.js "<单个srt文件路径>"
   ```
2. **读取提示词模板**：加载 `resources/prompt_template.md`
3. **AI 生成教程**：将模板中的占位符替换为实际内容后，生成中文 HTML 教程
   - `{{FILENAME}}` → 原始文件名
   - `{{SECTION}}` → 章节号
   - `{{SUBTITLE_TEXT}}` → 解析后的纯文本
4. **保存教程文件**：自动按章节创建子文件夹并写入，规则见下方「命名规范」
   - **自动创建文件夹**：保存前检查 `d:\JavaScript\text\{章节号}\` 是否存在，不存在则自动创建
   - **防覆盖**：如果目标文件已存在，自动追加版本号 `_v2`、`_v3`...
   - 例：`text/02/002_Hello_World.html` 已存在 → 保存为 `text/02/002_Hello_World_v2.html`
5. **报告进度**：`[3/24] ✅ 003 A Brief Introduction to JavaScript → 02/003_A_Brief_Introduction_to_JavaScript.html`

**关键要求：**
- 从文件名提取课题名（去掉序号和 `.en.srt` 后缀）
- 英文口语讲解 → 中文书面 HTML 教程
- 代码示例用 ` ```js ` 代码块
- 过滤口语填充词（"okay", "alright", "so", "right" 等）
- 保留讲师的教学逻辑和知识点递进关系

### 步骤 4：生成章节目录索引

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

如果用户只需转换单个文件，跳过步骤 2，直接从步骤 3 开始：

```bash
node d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\parse_srt.js "d:\JavaScript\02\002 Hello World!.en.srt"
```

---

## Jonas 专家级教学特色 (Jonas Signature Features)

本技能深度契合 Jonas Schmedtmann 的教学模型，在将字幕解析为教程时，要求**强制**实施以下学习体验增强：

1. **🏆 代码挑战考场模式 (Coding Challenge)**：
   - 凡字幕标题包含 "Challenge" 时，严格提取视频中的 `Tasks` (任务清单) 和 `Test Data` (测试数据) 单列。
   - 正文首发提供带提示注释的空白代码交互沙盒（`runnable-editor`），**严禁直接剧透答案代码**。
   - Jonas 的标准解法与“如何思考”推演过程，必须包裹在 `<details summary="💡 Jonas 官方解法拆解">` 折叠面板中，供用户做完后核对。
2. **🔄 先跑通后重构 (DRY 原则演进展现)**：
   - 捕捉讲师常常先写出略显冗余的代码，而后再教导优化的风格。
   - 当遇到代码优化重构（Refactoring）场景时，**必须**使用 `<div class="code-comparison">` 呈现红绿双栏绝佳的横向对比：左栏展示 `🚨 初版冗余写法 (The Naive Way)`，右栏展示 `✨ DRY 重构写法 (The Refactored Way)`，并标明重构背后的痛点解决。
3. **🧠 底层原理图解 (Behind the Scenes)**：
   - 全力备战核心硬核章节！只要涉及 JavaScript 运行底层（调用栈 Call Stack、执行上下文 Execution Context、Event Loop等），必定通过 Mermaid 语法绘制方块级堆叠图表定格动画过程。
   - 只要涉及变量作用域查找机制，务必调用探照灯式的路线箭头绘制出 **作用域链 (Scope Chain)** 寻址图。
4. **📚 MDN 官方文档超链接靶向附魔**：
   - 每节教程底部的**词汇速查表 (Cheat Sheet)** 中，强制新增一列「📚 官方文档溯源」。
   - 对于本节新引入的任意内置对象、方法、DOM API 操作符（如 `Math.trunc`, `document.querySelector`, `classList.toggle`），系统必须精准回溯并在该单元格提供真实可点击的 **MDN Web Docs 官方直达链接**。

---

## 教程输出格式标准

每个教程文件必须遵循以下结构：

```html
# {课题名}

> 📺 来源：{原始字幕文件名}
> 📂 章节：第 {N} 章

## 📌 知识脉络
- **前置知识**：{罗列学习本节需掌握的前提概念，如无则写"无"}
- **后续扩展**：{罗列本节知识将为后续哪些内容打下基础}

## 🎯 概述
（用 2-3 句话概括本节课核心内容）

## 核心知识点

### 1. {知识点标题}
> 🧩 **生活类比**：{日常事物打比方}

（带有主题配色和 Emoji 的彩色 Mermaid 图表 + 详细解释 + 关键代码）

**🔁 数据传递流向图**：{涉及变量/对象在不同作用域或函数间的传递时，必须用序列图画出数据传递路线}

**🔍 执行追踪：** 逐行展示变量状态变化
> 💡 **记忆口诀**：{如有易混概念，编写助记符}

### 2. {知识点标题}
（讲解 + 关键代码）

**📊 概念对比（如有易混淆项）：** 表格横向对比差异
> **💼 业务场景**：{提供一个使用本节知识点的真实世界业务场景，例如："在开发电商网站时，我们可以用数组方法来计算购物车总价"}

（结合上述场景，给出一份整合本节知识点的完整、可运行代码）

```js
// 完整示例代码
```

## 💡 关键要点
- ✅ 要点 1
- ✅ 要点 2
- ✅ 要点 3

## ⚠️ 常见误区
- ⚠️ 误区 1：...

## 🐛 报错实验室
> 主动展示错误写法及报错信息，教你看懂错误提示
## 📖 词汇速查表 (Cheat Sheet)
| 中文术语 | 英文术语 | 简明释义 | 速查代码（如有） |
|---------|---------|---------|---------------|
| 变量 | Variable | 用于存储数据的容器 | `let x = 10;` |
| ... | ... | ... | ... |

---

## 🧪 学习验证

### 📝 动手练习
（每个核心知识点后附 1-2 道编程练习，要求动手写代码）

**练习 1：{题目}**
```js
// 在这里写你的代码
```
<details><summary>💡 参考答案</summary>

```js
// 完整答案代码
```
</details>

### ❓ 理解检测
（3-5 道选择/判断题，测试概念理解）

1. {问题}？
   - A) ...
   - B) ...
   - C) ...

<details><summary>📋 答案与解析</summary>
（逐题给出答案和解释）
</details>

### 🔧 代码填空
（给出不完整代码，要求补全关键部分）

```js
// 补全下面的代码，使其...
const result = _______;
```
<details><summary>💡 答案</summary>

```js
// 完整代码
```
</details>

### 🎯 章节挑战（仅章节最后一课生成）
（综合本章所有知识点的小项目）
</main>
</div>
```

## 教程文件自动命名与目录规范

**从原始 `.srt` 文件名自动提取**，规则如下：

1. 取文件所在文件夹名（两位数字）作为 `{章节号}`
2. 取文件名开头数字作为 `{序号}`（保留三位，如 `002`）
3. 去掉序号和 `.en.srt` 后缀，空格替换为 `_`，得到 `{课题名}`
5. **自动创建章节文件夹**：`d:\JavaScript\text\{章节号}\`，不存在则创建
6. 拼接最终路径为 `d:\JavaScript\text\{章节号}\{序号}_{课题名}.html`

**自动命名示例：**

| 原始文件 | 输出路径 |
|---------|----------|
| `02/002 Hello World!.en.srt` | `text/02/002_Hello_World!.html` |
| `02/005 Values and Variables.en.srt` | `text/02/005_Values_and_Variables.html` |
| `03/003 Functions.en.srt` | `text/03/003_Functions.html` |

**自动创建文件夹机制：**
- 保存前检查 `d:\JavaScript\text\{章节号}\` 是否存在
- 若不存在，自动创建该目录（使用 `write_to_file` 工具会自动创建父目录）
- 例：转换 `02` 文件夹时，自动创建 `d:\JavaScript\text\02\`

**防覆盖机制：**
- 保存前检查目标路径下是否已有同名文件
- 若已存在，自动追加版本号：`_v2`、`_v3`...
- 示例：`text/02/002_Hello_World!.html` 已存在 → `text/02/002_Hello_World!_v2.html`
- 永远不会覆盖已有文件

## 质量检查清单

生成每个教程后，必须验证：
- [ ] 所有代码块使用 `js` 语法高亮
- [ ] 代码示例可独立运行（必要时补充缺失的上下文）
- [ ] 逻辑自我交叉验证通过：类例通俗无瑕疵，代码和结果完全正确
- [ ] 抽象内容用带有配色与 Emoji 的强化版 Mermaid 图解
- [ ] 涉及变量传参/赋值的地方是否画出了【数据传递方向追踪图】？
- [ ] 无英文口语残留（"okay", "so", "right" 等）
- [ ] 知识点有清晰的递进逻辑
- [ ] 中文表述通顺，术语准确（如 "变量" 而非 "variable"）
- [ ] 课题名与内容一致
- [ ] 动手练习与知识点一一对应，难度适当
- [ ] Quiz 答案正确，解析清晰
- [ ] 代码填空的空缺位置指向核心概念
- [ ] 章节挑战（如有）覆盖本章主要知识点

## 文件路径约定

| 项目 | 路径 |
|------|------|
| 字幕源目录 | `d:\JavaScript\01` ~ `d:\JavaScript\20` |
| 教程输出根目录 | `d:\JavaScript\text\` |
| 章节教程目录 | `d:\JavaScript\text\{章节号}\`（如 `text\01\`、`text\02\`） |
| 目录索引 | `d:\JavaScript\text\index.md` |
| SRT 解析脚本 | `d:\JavaScript\.agents\skills\subtitle-to-tutorial\scripts\parse_srt.js` |
| 提示词模板 | `d:\JavaScript\.agents\skills\subtitle-to-tutorial\resources\prompt_template.md` |
