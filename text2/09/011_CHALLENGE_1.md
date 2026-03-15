# 🏆 代码挑战 #1（Coding Challenge #1）

> 📺 来源：011 CHALLENGE #1.en.srt
> 📂 章节：第 09 章

## 🎯 挑战目标

运用本章前半部分学到的核心技能——**解构、展开运算符、Rest 模式、短路求值和逻辑运算符**——来处理一场足球比赛的数据。

---

## 📋 比赛数据

```js {runnable} {title="challenge1.js"}
const game = {
  team1: 'Bayern Munich',
  team2: 'Borrussia Dortmund',
  players: [
    [
      'Neuer', 'Pavard', 'Martinez', 'Alaba', 'Davies',
      'Kimmich', 'Goretzka', 'Coman', 'Muller', 'Gnarby', 'Lewandowski',
    ],
    [
      'Burki', 'Schulz', 'Hummels', 'Akanji', 'Hakimi',
      'Weigl', 'Witsel', 'Hazard', 'Brandt', 'Sancho', 'Gotze',
    ],
  ],
  score: '4:0',
  scored: ['Lewandowski', 'Gnarby', 'Lewandowski', 'Hummels'],
  date: 'Nov 9th, 2037',
  odds: {
    team1: 1.33,
    x: 3.25,
    team2: 6.5,
  },
};

// 在下方完成任务 👇
```

---

## 📝 任务清单 (Tasks)

1. 为每支队伍创建一个球员数组（`players1` 和 `players2`）
2. 第一支队伍（拜仁慕尼黑）：创建一个 `gk`（门将）变量存储第一个球员，以及 `fieldPlayers` 数组存储剩余 10 名球员
3. 创建一个 `allPlayers` 数组，包含两支球队的全部 22 名球员
4. 基于 `players1`，创建新数组 `players1Final`，额外添加 3 名替补球员：`'Thiago'`、`'Coutinho'`、`'Periscic'`
5. 基于 `game.odds` 对象，创建三个变量 `team1`、`draw`、`team2`
6. 编写函数 `printGoals(...players)`：接收任意数量的球员名，打印每个球员名并在最后输出进球总数。测试数据：先用 `'Davies'`, `'Muller'`, `'Lewandowski'`, `'Kimmich'` 调用，再用 `game.scored` 调用
7. 不使用 `if/else` 或三元运算符，打印哪支球队更可能赢（赔率低 = 更可能赢）

---

## 🧪 自测沙盒

> ⚠️ 请先自己尝试完成所有任务，再查看下方的官方解法！

```js {runnable} {title="your_solution.js"}
const game = {
  team1: 'Bayern Munich',
  team2: 'Borrussia Dortmund',
  players: [
    ['Neuer', 'Pavard', 'Martinez', 'Alaba', 'Davies',
     'Kimmich', 'Goretzka', 'Coman', 'Muller', 'Gnarby', 'Lewandowski'],
    ['Burki', 'Schulz', 'Hummels', 'Akanji', 'Hakimi',
     'Weigl', 'Witsel', 'Hazard', 'Brandt', 'Sancho', 'Gotze'],
  ],
  score: '4:0',
  scored: ['Lewandowski', 'Gnarby', 'Lewandowski', 'Hummels'],
  date: 'Nov 9th, 2037',
  odds: { team1: 1.33, x: 3.25, team2: 6.5 },
};

// 💡 提示：
// 任务 1 → 数组解构
// 任务 2 → Rest 模式
// 任务 3 → 展开运算符
// 任务 4 → 展开运算符 + 新元素
// 任务 5 → 嵌套对象解构 + 重命名
// 任务 6 → 剩余参数 + .length
// 任务 7 → && 短路求值

// 在这里写你的代码 👇
```

---

<details><summary>💡 Jonas 官方解法拆解</summary>

### 任务 1：解构球员数组

```js
// 数组解构 — 将 game.players 的两个子数组分别赋给变量
const [players1, players2] = game.players;
```

**思考链路**：`game.players` 是一个包含两个数组的数组 → 数组解构直接按位置取出。

---

### 任务 2：门将 + 场上球员

```js
// Rest 模式 — 第一个是门将，其余是场上球员
const [gk, ...fieldPlayers] = players1;
```

**思考链路**：门将是数组的第一个元素 → 用 Rest 模式收集剩余 10 人。

---

### 任务 3：合并所有球员

```js
// 展开运算符 — 合并两个数组
const allPlayers = [...players1, ...players2];
```

---

### 任务 4：添加替补球员

```js
// 展开原数组 + 添加新元素
const players1Final = [...players1, 'Thiago', 'Coutinho', 'Periscic'];
```

---

### 任务 5：嵌套对象解构 + 重命名

```js
// 从 game 对象中解构 odds，再从 odds 中解构出三个变量
// x 重命名为 draw
const { odds: { team1, x: draw, team2 } } = game;
```

**思考链路**：`odds` 是嵌套对象 → 用 `属性: { 内部解构 }` 语法穿透。`x` 不够语义化 → 用 `: draw` 重命名。

---

### 任务 6：打印进球函数

```js
// 剩余参数接收任意数量的球员名
const printGoals = function (...players) {
  console.log(players);
  console.log(`${players.length} goals were scored`);
};

// 直接传入球员名
printGoals('Davies', 'Muller', 'Lewandowski', 'Kimmich');
// 4 goals were scored

// 展开 game.scored 数组传入
printGoals(...game.scored);
// 4 goals were scored
```

**思考链路**：任意数量参数 → 剩余参数（Rest Parameters）。传入数组 → 展开运算符。

---

### 任务 7：不用 if/三元判断谁赢

```js
// AND 短路求值 — 条件为真时执行后面的语句
team1 < team2 && console.log('Team 1 is more likely to win');
team1 > team2 && console.log('Team 2 is more likely to win');
```

**思考链路**：赔率低 → 更可能赢。`&&` 在第一个操作数为真时才执行第二个操作数。

---

### 完整解法

```js {runnable} {title="solution.js"}
const game = {
  team1: 'Bayern Munich',
  team2: 'Borrussia Dortmund',
  players: [
    ['Neuer', 'Pavard', 'Martinez', 'Alaba', 'Davies',
     'Kimmich', 'Goretzka', 'Coman', 'Muller', 'Gnarby', 'Lewandowski'],
    ['Burki', 'Schulz', 'Hummels', 'Akanji', 'Hakimi',
     'Weigl', 'Witsel', 'Hazard', 'Brandt', 'Sancho', 'Gotze'],
  ],
  score: '4:0',
  scored: ['Lewandowski', 'Gnarby', 'Lewandowski', 'Hummels'],
  date: 'Nov 9th, 2037',
  odds: { team1: 1.33, x: 3.25, team2: 6.5 },
};

// 1. 解构球员数组
const [players1, players2] = game.players;

// 2. 门将 + 场上球员（Rest 模式）
const [gk, ...fieldPlayers] = players1;

// 3. 合并所有球员（展开运算符）
const allPlayers = [...players1, ...players2];

// 4. 添加替补
const players1Final = [...players1, 'Thiago', 'Coutinho', 'Periscic'];

// 5. 嵌套解构 + 重命名
const { odds: { team1, x: draw, team2 } } = game;

// 6. 打印进球函数（剩余参数）
const printGoals = function (...players) {
  console.log(`${players.length} goals were scored`);
};
printGoals('Davies', 'Muller', 'Lewandowski', 'Kimmich'); // 4
printGoals(...game.scored); // 4

// 7. 判断谁赢（AND 短路）
team1 < team2 && console.log('Team 1 is more likely to win');
team1 > team2 && console.log('Team 2 is more likely to win');
```

</details>

---

## 📖 知识点索引

| 任务 | 用到的知识点 |
|:----:|------------|
| 1 | 数组解构 |
| 2 | Rest 模式 |
| 3 | 展开运算符（数组合并） |
| 4 | 展开运算符 + 新元素 |
| 5 | 嵌套对象解构 + 重命名 |
| 6 | 剩余参数 + 展开运算符 |
| 7 | AND 短路求值 |
