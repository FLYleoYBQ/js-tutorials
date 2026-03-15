# 🏆 编程挑战 #4（Coding Challenge #4）

> 📺 来源：029 CHALLENGE #4 Video Solution.en.srt
> 📂 章节：第 02 章

## 📌 知识脉络
- **前置知识**：三元运算符（Ternary Operator）、模板字面量、逻辑运算符
- **后续扩展**：函数（Functions）

## 🎯 概述
使用**三元运算符**实现小费计算器：账单 50~300 之间收 15%，否则 20%。用**模板字面量**输出完整信息。

---

## 🏋️ 挑战任务

| 测试 | 账单 | 预期小费 | 预期总额 |
|------|------|---------|---------|
| 1 | ¥275 | ¥41.25（15%）| ¥316.25 |
| 2 | ¥40 | ¥8（20%）| ¥48 |
| 3 | ¥430 | ¥86（20%）| ¥516 |

## 🧪 实战沙盒

```js {runnable} {title="challenge4.js"}
// 🏆 小费计算器（三元运算符版）
// 50~300 之间：15%，否则 20%
// 用模板字面量输出 bill、tip、total

// 在这里写你的代码 👇
```

<details><summary>💡 Jonas 官方解法</summary>

```js
const bill = 275;
const tip = bill >= 50 && bill <= 300 ? bill * 0.15 : bill * 0.2;
console.log(`The bill was ${bill}, the tip was ${tip}, and the total value ${bill + tip}`);
```

**关键点**：三元运算符是表达式，可直接赋值；`&&` 组合范围条件；`${}` 中放 `bill + tip` 表达式。

</details>

---

## 🧪 学习验证

:::quiz {correct="B"}
**1. bill=40 时 tip 是？**
- A) 6
- B) 8
- C) 40

> **解析**：40 不在 50~300 范围内，走 `bill * 0.2 = 8`。
:::

:::quiz {correct="C"}
**2. 三元运算符可用于模板字面量因为？**
- A) 它是语句
- B) 特殊语法
- C) 它是表达式（产生值）

> **解析**：三元运算符产生值，可放在 `${}` 中。
:::
