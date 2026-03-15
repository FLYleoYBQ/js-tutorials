# 🏆 编程挑战 #2（Coding Challenge #2）

> 📺 来源：017 CHALLENGE #2 Video Solution.en.srt
> 📂 章节：第 02 章

## 📌 知识脉络
- **前置知识**：if/else 语句、比较运算符、模板字面量（Template Literals）
- **后续扩展**：类型转换与类型强制（Type Conversion and Coercion）、逻辑运算符

## 🎯 概述
在编程挑战 #1 的基础上扩展：使用 `if/else` 语句判断 Mark 和 John 谁的 BMI 更高，并使用**模板字面量**将具体的 BMI 数值包含在输出信息中。

---

## 🏋️ 挑战任务

### Tasks（任务清单）
1. 使用挑战 #1 的数据，用 `if/else` 判断谁的 BMI 更高
2. 输出格式如 `"Mark's BMI (27.3) is higher than John's (24.2)!"`
3. 使用**模板字面量**插入实际 BMI 值
4. 分别测试两组数据

### Test Data（测试数据集）

| 数据集 | Mark 体重 | Mark 身高 | John 体重 | John 身高 |
|--------|----------|----------|----------|----------|
| **数据 1** | 78 kg | 1.69 m | 92 kg | 1.95 m |
| **数据 2** | 95 kg | 1.88 m | 85 kg | 1.76 m |

---

## 🧪 实战沙盒（先自己写！）

```js {runnable} {title="challenge2.js"}
// 🏆 编程挑战 #2：BMI 对比 + if/else + 模板字面量
//
// 提示：
// 1. 沿用挑战 #1 的 BMI 计算代码
// 2. 用 if/else 判断谁的 BMI 更高
// 3. 用模板字面量 `` 在输出中嵌入 BMI 值
// 4. 注意反引号和 ${} 语法

// 在这里写你的代码 👇

```

---

<details><summary>💡 Jonas 官方解法拆解</summary>

### 思考链路

**关键组合技**：编程挑战 #1 的算术 + if/else 分支 + 模板字面量插值——三个知识点联合应用。

### 完整解法

```js
// Test Data 1
const massMark = 78;
const heightMark = 1.69;
const massJohn = 92;
const heightJohn = 1.95;

const bmiMark = massMark / heightMark ** 2;
const bmiJohn = massJohn / (heightJohn * heightJohn);

console.log(bmiMark, bmiJohn);

if (bmiMark > bmiJohn) {
  console.log(`Mark's BMI (${bmiMark}) is higher than John's (${bmiJohn})!`);
} else {
  console.log(`John's BMI (${bmiJohn}) is higher than Mark's (${bmiMark})!`);
}
```

### 运行结果

**数据集 1**（Mark BMI ≈ 27.31, John BMI ≈ 24.19）：
```
Mark's BMI (27.309968138370508) is higher than John's (24.194608809993426)!
```

**数据集 2**（Mark BMI ≈ 26.88, John BMI ≈ 27.44）：
```
John's BMI (27.44059917355372) is higher than Mark's (26.87867813490267)!
```

### 关键知识点回顾
- ✅ `if/else` 根据条件决定执行哪个代码块
- ✅ 模板字面量中 `${}` 可以插入任何变量
- ✅ 变量的好处：切换测试数据只需修改初始值

</details>

---

## 📖 词汇速查表 (Cheat Sheet)

| 中文术语 | 英文术语 | 简明释义 | 速查代码 | 📚 官方文档 |
|---------|---------|---------|---------|-----------|
| if/else 语句 | if/else Statement | 条件分支控制结构 | `if (cond) {} else {}` | [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/if...else) |
| 模板字面量 | Template Literal | 用反引号创建的增强字符串 | `` `${var}` `` | [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals) |

---

## 🧪 学习验证

### 📝 动手练习

**练习 1：成绩等级判断**
```js {runnable} {title="exercise1.js"}
// 根据分数判断等级并输出：
// >= 90: "A（优秀）"
// >= 80: "B（良好）"  
// >= 60: "C（及格）"
// < 60: "D（不及格）"
// 用模板字面量输出："{name} 的分数是 {score} 分，等级为 {grade}"

const name = "Alice";
const score = 85;
// 在这里写你的代码
```
<details><summary>💡 参考答案</summary>

```js
const name = "Alice";
const score = 85;
let grade;

if (score >= 90) {
  grade = "A（优秀）";
} else if (score >= 80) {
  grade = "B（良好）";
} else if (score >= 60) {
  grade = "C（及格）";
} else {
  grade = "D（不及格）";
}

console.log(`${name} 的分数是 ${score} 分，等级为 ${grade}`);
```
**解题思路**：结合 `if/else if/else` 和模板字面量，注意 `grade` 必须在块外声明。
</details>

**练习 2：两人身高比较**
```js {runnable} {title="exercise2.js"}
// 比较两个人的身高，输出谁更高以及高多少
// 用模板字面量包含具体数值

const heightAlice = 168;
const heightBob = 175;
// 在这里写你的代码
```
<details><summary>💡 参考答案</summary>

```js
const heightAlice = 168;
const heightBob = 175;

if (heightAlice > heightBob) {
  console.log(`Alice (${heightAlice}cm) 比 Bob (${heightBob}cm) 高 ${heightAlice - heightBob}cm`);
} else {
  console.log(`Bob (${heightBob}cm) 比 Alice (${heightAlice}cm) 高 ${heightBob - heightAlice}cm`);
}
```
**解题思路**：在模板字面量的 `${}` 中直接做减法运算。
</details>

### ❓ 理解检测

:::quiz {correct="B"}
**1. 模板字面量中的 `${}` 可以放入什么？**
- A) 只能放变量名
- B) 任何 JavaScript 表达式（变量、运算、函数调用等）
- C) 只能放字符串

> **解析**：`${}` 支持任何 JavaScript 表达式，包括变量、算术运算、比较运算、函数调用等。
:::

:::quiz {correct="C"}
**2. if/else 语句中条件的数据类型是？**
- A) String
- B) Number
- C) Boolean

> **解析**：if 括号中的条件最终需要是布尔值（`true`/`false`）。比较运算符 `>` 会返回布尔值。
:::

:::quiz {correct="A"}
**3. 以下哪行代码正确使用了模板字面量？**
- A) `` console.log(`BMI is ${bmi}`) ``
- B) `console.log("BMI is ${bmi}")`
- C) `console.log('BMI is ${bmi}')`

> **解析**：只有反引号 `` ` `` 支持 `${}` 插值语法。双引号和单引号会原样输出 `${bmi}` 文本。
:::

### 🔧 代码填空

:::fill-blank
if (scoreA > scoreB) {
  console.log(___`___A wins with ${scoreA} points___`___);
} ___else___ {
  console.log(`B wins with ${scoreB} points`);
}
:::
