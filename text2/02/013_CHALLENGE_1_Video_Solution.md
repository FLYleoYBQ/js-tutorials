# 🏆 编程挑战 #1（Coding Challenge #1）

> 📺 来源：013 CHALLENGE #1 Video Solution.en.srt
> 📂 章节：第 02 章

## 📌 知识脉络
- **前置知识**：基本运算符（Basic Operators）、运算符优先级（Operator Precedence）、let/const 声明
- **后续扩展**：字符串与模板字面量（Strings and Template Literals）、if/else 判断

## 🎯 概述
本节是第一个编程挑战！通过计算 **BMI（身体质量指数）** 来综合练习变量声明、算术运算符和比较运算符。包含两组测试数据，要求比较两个人的 BMI 值。

---

## 🏋️ 挑战任务

### Tasks（任务清单）
1. 分别存储 Mark 和 John 的体重（`mass`，kg）和身高（`height`，m）到变量中
2. 使用公式 `BMI = mass / (height ** 2)` 或 `BMI = mass / (height * height)` 计算两人的 BMI
3. 创建一个布尔变量 `markHigherBMI`，判断 Mark 的 BMI 是否大于 John 的 BMI

### Test Data（测试数据集）

| 数据集 | Mark 体重 | Mark 身高 | John 体重 | John 身高 |
|--------|----------|----------|----------|----------|
| **数据 1** | 78 kg | 1.69 m | 92 kg | 1.95 m |
| **数据 2** | 95 kg | 1.88 m | 85 kg | 1.76 m |

---

## 🧪 实战沙盒（先自己写！）

```js {runnable} {title="challenge1.js"}
// 🏆 编程挑战 #1：BMI 对比器
// 
// 提示：
// 1. 用 const 声明体重和身高变量
// 2. BMI 公式：mass / height ** 2
// 3. 用比较运算符 > 判断谁的 BMI 更高
// 4. 记得测试两组数据！

// 在这里写你的代码 👇

```

---

<details><summary>💡 Jonas 官方解法拆解</summary>

### 思考链路

**第一步：存储数据**
选择 `const` 声明，因为在当前程序中这些值不会改变。使用描述性变量名（如 `massMark` 而非 `m1`）。

**第二步：计算 BMI**
两种等价公式都行：
- `mass / height ** 2`（使用求幂运算符）
- `mass / (height * height)`（使用乘法）

**第三步：比较**
用 `>` 比较运算符，结果自动是 Boolean 值，直接存入变量。

### 数据集 1 的完整解法

```js
// Test Data 1
const massMark = 78;
const heightMark = 1.69;
const massJohn = 92;
const heightJohn = 1.95;

// 计算 BMI（使用两种不同公式）
const bmiMark = massMark / heightMark ** 2;        // 公式 1
const bmiJohn = massJohn / (heightJohn * heightJohn); // 公式 2

console.log(bmiMark, bmiJohn);
// 27.309968138370508  24.194608809993426

// 判断 Mark 的 BMI 是否更高
const markHigherBMI = bmiMark > bmiJohn;
console.log(markHigherBMI); // true
```

### 数据集 2 的完整解法

```js
// Test Data 2
const massMark = 95;
const heightMark = 1.88;
const massJohn = 85;
const heightJohn = 1.76;

const bmiMark = massMark / heightMark ** 2;
const bmiJohn = massJohn / heightJohn ** 2;

console.log(bmiMark, bmiJohn);
// 26.87867813490267  27.44059917355372

const markHigherBMI = bmiMark > bmiJohn;
console.log(markHigherBMI); // false（这次 John 的 BMI 更高）
```

### 关键知识点回顾
- ✅ 使用**变量**的好处：切换测试数据只需修改变量值，后续计算代码无需改变
- ✅ `const` 是默认选择——这些值在当前程序中不会改变
- ✅ 比较运算符 `>` 返回 Boolean 值，可以直接存入变量
- ✅ 两种 BMI 公式等价：`mass / height ** 2` ≡ `mass / (height * height)`

</details>

---

## 📖 词汇速查表 (Cheat Sheet)

| 中文术语 | 英文术语 | 简明释义 | 速查代码 | 📚 官方文档 |
|---------|---------|---------|---------|-----------|
| 求幂运算符 | Exponentiation | 计算幂 | `2 ** 3 // 8` | [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Exponentiation) |
| 比较运算符 | Comparison Operator | 比较两个值返回布尔 | `a > b` | [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_operators#comparison_operators) |
| 变量声明 | Variable Declaration | 创建新变量 | `const x = 10;` | [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/const) |

---

## 🧪 学习验证

### 📝 动手练习

**练习 1：扩展 BMI 计算器**
```js {runnable} {title="exercise1.js"}
// 在 BMI 计算的基础上，额外计算两人的 BMI 差值
// 并判断差值是否大于 5（差距是否显著）

// 在这里写你的代码
```
<details><summary>💡 参考答案</summary>

```js
const massMark = 78;
const heightMark = 1.69;
const massJohn = 92;
const heightJohn = 1.95;

const bmiMark = massMark / heightMark ** 2;
const bmiJohn = massJohn / heightJohn ** 2;

// 注意：差值需要取绝对值概念（这里简单用减法）
const bmiDiff = bmiMark - bmiJohn;
console.log("BMI 差值:", bmiDiff); // ≈ 3.12

const isSignificant = bmiDiff > 5;
console.log("差距显著:", isSignificant); // false
```
**解题思路**：在原有计算基础上新增差值计算和比较，练习多步运算。
</details>

**练习 2：三人 BMI 比拼**
```js {runnable} {title="exercise2.js"}
// 新增 Sarah 的数据：65kg, 1.65m
// 计算三人的 BMI，找出谁的 BMI 最高

// 在这里写你的代码
```
<details><summary>💡 参考答案</summary>

```js
const bmiMark = 78 / 1.69 ** 2;   // ≈ 27.31
const bmiJohn = 92 / 1.95 ** 2;   // ≈ 24.19
const bmiSarah = 65 / 1.65 ** 2;  // ≈ 23.88

console.log("Mark:", bmiMark);
console.log("John:", bmiJohn);
console.log("Sarah:", bmiSarah);

console.log("Mark > John:", bmiMark > bmiJohn);    // true
console.log("Mark > Sarah:", bmiMark > bmiSarah);  // true
// Mark 的 BMI 最高
```
**解题思路**：对三个人两两比较，最终确定最高者。
</details>

### ❓ 理解检测

:::quiz {correct="B"}
**1. BMI 的计算公式 `mass / height ** 2` 中，哪个运算先执行？**
- A) 除法 `/`
- B) 求幂 `**`
- C) 两者同时执行

> **解析**：求幂运算符 `**` 的优先级（16）高于除法 `/`（15），所以先计算 `height ** 2`，再做除法。
:::

:::quiz {correct="C"}
**2. 为什么推荐用 `const` 而不是 `let` 来声明体重和身高？**
- A) `let` 不能存储小数
- B) `const` 运行更快
- C) 这些值在程序中不需要改变，`const` 能防止意外修改

> **解析**：最佳实践是默认使用 `const`，只有值确实需要改变时才用 `let`。`const` 不是性能优化，而是代码安全性保障。
:::

:::quiz {correct="A"}
**3. `bmiMark > bmiJohn` 这个表达式的返回值类型是？**
- A) Boolean
- B) Number
- C) String

> **解析**：比较运算符 `>` 的结果永远是布尔值（`true` 或 `false`）。
:::

### 🔧 代码填空

:::fill-blank
// BMI 计算公式
const bmi = mass / height ___**___ 2;

// 比较运算符的结果是布尔值
const isHigher = bmiA ___>___ bmiB;

// 默认使用的变量声明关键字
___const___ name = "Jonas";
:::
