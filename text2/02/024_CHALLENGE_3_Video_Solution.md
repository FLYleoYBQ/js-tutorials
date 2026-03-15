# 🏆 编程挑战 #3（Coding Challenge #3）

> 📺 来源：024 CHALLENGE #3 Video Solution.en.srt
> 📂 章节：第 02 章

## 📌 知识脉络
- **前置知识**：if/else 语句、逻辑运算符（`&&`、`||`）、比较运算符
- **后续扩展**：switch 语句、三元运算符

## 🎯 概述
使用 if/else 语句和逻辑运算符比较两支队伍的**平均分**，根据多重条件判断冠军。包含两个进阶 Bonus——添加最低分数线要求，以及处理平局的最低分数规则。

---

## 🏋️ 挑战任务

### Tasks（任务清单）
1. 计算两支队伍各三场比赛的**平均分**
2. 用 if/else 判断哪支队伍赢得奖杯（平均分更高的一方获胜，平局也要处理）
3. **Bonus 1**：增加最低 100 分的条件——队伍必须平均分 ≥ 100 才能获胜
4. **Bonus 2**：平局时也要求双方平均分 ≥ 100 才算有效平局

### Test Data（测试数据集）

| 数据集 | Dolphins 三场 | Koalas 三场 |
|--------|-------------|------------|
| **数据 1** | 96, 108, 89 | 88, 91, 110 |
| **Bonus 1** | 97, 112, 101 | 109, 95, 123 |
| **Bonus 2** | 97, 112, 101 | 109, 95, 106 |

---

## 🧪 实战沙盒（先自己写！）

```js {runnable} {title="challenge3.js"}
// 🏆 编程挑战 #3：队伍对决
//
// 提示：
// 1. 平均分 = (score1 + score2 + score3) / 3
// 2. 用 && 组合多个条件
// 3. Bonus 1：获胜条件加上 averageScore >= 100
// 4. Bonus 2：平局也需要双方 >= 100

// 在这里写你的代码 👇

```

---

<details><summary>💡 Jonas 官方解法拆解</summary>

### 基础解法

```js
const scoreDolphins = (96 + 108 + 89) / 3;
const scoreKoalas = (88 + 91 + 110) / 3;
console.log(scoreDolphins, scoreKoalas);

if (scoreDolphins > scoreKoalas) {
  console.log("Dolphins win the trophy 🏆");
} else if (scoreKoalas > scoreDolphins) {
  console.log("Koalas win the trophy 🏆");
} else {
  console.log("Both win the trophy! 🏆🏆");
}
```

### Bonus 1 + 2：加最低分条件

```js
const scoreDolphins = (97 + 112 + 101) / 3;
const scoreKoalas = (109 + 95 + 106) / 3;

if (scoreDolphins > scoreKoalas && scoreDolphins >= 100) {
  console.log("Dolphins win the trophy 🏆");
} else if (scoreKoalas > scoreDolphins && scoreKoalas >= 100) {
  console.log("Koalas win the trophy 🏆");
} else if (scoreDolphins === scoreKoalas && scoreDolphins >= 100 && scoreKoalas >= 100) {
  console.log("Both win the trophy! 🏆🏆");
} else {
  console.log("No one wins the trophy 😢");
}
```

### 关键知识点
- ✅ `&&` 连接多个必要条件
- ✅ `else if` 链处理多种场景
- ✅ 最后的 `else` 作为兜底（所有条件都不满足时）

</details>

---

## 📖 词汇速查表 (Cheat Sheet)

| 中文术语 | 英文术语 | 简明释义 | 速查代码 | 📚 官方文档 |
|---------|---------|---------|---------|-----------|
| 逻辑与 | AND `&&` | 全真才真 | `a && b` | [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Logical_AND) |
| if/else if/else | 链式条件 | 多分支判断 | `if {} else if {} else {}` | [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/if...else) |

---

## 🧪 学习验证

### 📝 动手练习

**练习 1：三人成绩排名**
```js {runnable} {title="exercise1.js"}
// 三个学生的平均分排名，输出第一名
const avgAlice = (85 + 92 + 78) / 3;
const avgBob = (90 + 88 + 95) / 3;
const avgCharlie = (78 + 85 + 80) / 3;
// 在这里写你的代码
```
<details><summary>💡 参考答案</summary>

```js
const avgAlice = (85 + 92 + 78) / 3;
const avgBob = (90 + 88 + 95) / 3;
const avgCharlie = (78 + 85 + 80) / 3;

if (avgAlice > avgBob && avgAlice > avgCharlie) {
  console.log(`Alice 第一名！平均分: ${avgAlice.toFixed(1)}`);
} else if (avgBob > avgAlice && avgBob > avgCharlie) {
  console.log(`Bob 第一名！平均分: ${avgBob.toFixed(1)}`);
} else {
  console.log(`Charlie 第一名！平均分: ${avgCharlie.toFixed(1)}`);
}
```
</details>

### ❓ 理解检测

:::quiz {correct="B"}
**1. `scoreDolphins > scoreKoalas && scoreDolphins >= 100` 中，如果 Dolphins 分数为 95 且高于 Koalas，结果是？**
- A) `true`
- B) `false`
- C) 报错

> **解析**：虽然 `scoreDolphins > scoreKoalas` 为 `true`，但 `scoreDolphins >= 100` 为 `false`。`true && false` = `false`。
:::

:::quiz {correct="A"}
**2. 为什么在平局判断中不能只用 `else`？**
- A) 因为加了最低分条件后，平局也可能"无效"——需要用 `else if` 检查双方都 ≥ 100
- B) 因为 JavaScript 不支持三个以上的 `else if`
- C) 因为 `else` 块不能包含 `console.log`

> **解析**：Bonus 2 要求平局必须双方都 ≥ 100 分。如果直接用 `else`，即使双方都低于 100 也会被判为有效平局。
:::

:::quiz {correct="C"}
**3. `(96 + 108 + 89) / 3` 中括号的作用是？**
- A) 装饰用的，可以去掉
- B) 让代码更美观
- C) 确保加法先于除法执行（覆盖运算符优先级）

> **解析**：除法优先级高于加法。没有括号会先算 `89/3`，结果错误。
:::

### 🔧 代码填空

:::fill-blank
// 获胜条件：分数更高 AND 达到最低分数线
if (scoreA > scoreB ___&&___ scoreA >= 100) {
  console.log("A wins!");
}
:::
