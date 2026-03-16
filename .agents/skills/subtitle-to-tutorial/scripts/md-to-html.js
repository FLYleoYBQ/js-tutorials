/**
 * Markdown → HTML 教程转换器
 *
 * 将 subtitle-to-tutorial 技能生成的 Markdown 教程转换为
 * 完整的、可在浏览器中直接运行的 HTML 单文件。
 *
 * 特性：
 * - 零依赖，纯 Node.js 实现
 * - 支持标准 Markdown（标题、代码块、表格、列表、引用、粗体、斜体、行内代码、链接、图片、水平线）
 * - 支持自定义组件语法：:::quiz、:::fill-blank、:::code-comparison、```js {runnable}
 * - 自动生成侧边栏目录
 * - 复用 html_template.html 的 CSS 和 JS
 *
 * 用法：
 *   单文件:  node md-to-html.js "path/to/tutorial.md"
 *   批量:    node md-to-html.js "path/to/chapter_dir" --batch
 *   全量:    node md-to-html.js "d:\JavaScript\text" --all
 *
 * @module md-to-html
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. HTML 模板加载
// ============================================================

/**
 * 从 html_template.html 中提取 CSS 和 JS 部分
 *
 * @returns {{ css: string, scripts: string }}
 */
function loadTemplate() {
  const templatePath = path.join(__dirname, '..', 'resources', 'html_template.html');
  const html = fs.readFileSync(templatePath, 'utf-8');

  // 提取 <style> 内容
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  const css = styleMatch ? styleMatch[1] : '';

  // 提取所有 <script> 内容（包括外部引用和内联脚本）
  const scriptBlocks = [];
  const scriptRegex = /<script[\s\S]*?<\/script>/g;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    scriptBlocks.push(match[0]);
  }
  const scripts = scriptBlocks.join('\n\n');

  return { css, scripts };
}

// ============================================================
// 2a. HTML 块内 Markdown 处理器
// ============================================================

/**
 * 处理 <details> 等 HTML 块内嵌的 Markdown 语法
 * 支持：代码块、mermaid、表格、标题、列表、引用、粗体、行内代码
 *
 * @param {string} block - HTML 块的原始文本
 * @returns {string} 处理后的 HTML 文本
 */
function processMarkdownInHtmlBlock(block) {
  // 1. 先保护已有的 HTML 标签（<details>, <summary>, </details> 等）
  const htmlTagMap = new Map();
  let tagIdx = 0;
  block = block.replace(/<\/?(?:details|summary)[^>]*>/gi, (match) => {
    const key = `__HTML_TAG_${tagIdx++}__`;
    htmlTagMap.set(key, match);
    return key;
  });

  // 2. 处理代码块（包括 mermaid）
  const codeBlockMap = new Map();
  let codeBlockIdx = 0;
  block = block.replace(/```(\w*)\s*(.*?)?\n([\s\S]*?)```/g, (_, lang, attrs, code) => {
    let html;
    if (lang === 'mermaid') {
      // 转义 <br/> 为 HTML 实体，防止浏览器解析后消失
      const safeCode = code.replace(/<br\s*\/?>/gi, '&lt;br/&gt;');
      html = `<div class="mermaid">\n${safeCode}\n</div>`;
    } else {
      const langClass = lang ? ` class="language-${lang === 'js' ? 'javascript' : lang}"` : '';
      html = `<pre><code${langClass}>${escapeHtml(code)}</code></pre>`;
    }
    // 将生成的 HTML 块加入保护，防止后续行内处理破坏
    const key = `__CODE_BLOCK_${codeBlockIdx++}__`;
    codeBlockMap.set(key, html);
    return key;
  });

  // 3. 处理表格
  block = block.replace(/(^|\n)(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.+\|\n?)+)/gm, (_, prefix, header, sep, bodyStr) => {
    const headerCells = header.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    const bodyRows = bodyStr.trim().split('\n').map(row =>
      row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
    );
    const thHtml = headerCells.map(c => `<th>${parseInline(c)}</th>`).join('');
    const tbodyHtml = bodyRows.map(row =>
      `<tr>${row.map(c => `<td>${parseInline(c)}</td>`).join('')}</tr>`
    ).join('\n');
    return `${prefix}<table>
    <thead><tr>${thHtml}</tr></thead>
    <tbody>${tbodyHtml}</tbody>
</table>`;
  });

  // 4. 处理标题（### h3, ## h2 等）
  block = block.replace(/(^|\n)(#{1,6})\s+(.+)/g, (_, prefix, hashes, text) => {
    const level = hashes.length;
    return `${prefix}<h${level}>${parseInline(text)}</h${level}>`;
  });

  // 5. 处理无序列表
  block = block.replace(/(^|\n)((?:[-*+]\s+.+\n?)+)/gm, (_, prefix, listBlock) => {
    const items = listBlock.trim().split('\n')
      .filter(l => /^[-*+]\s+/.test(l))
      .map(l => `<li>${parseInline(l.replace(/^[-*+]\s+/, ''))}</li>`);
    return `${prefix}<ul>\n${items.join('\n')}\n</ul>`;
  });

  // 6. 处理行内 Markdown（粗体、斜体、行内代码、链接）
  block = block.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  block = block.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  block = block.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

  // 7. 还原 HTML 标签
  for (const [key, value] of htmlTagMap) {
    block = block.replace(key, value);
  }

  // 8. 还原代码块
  for (const [key, value] of codeBlockMap) {
    block = block.replace(key, value);
  }

  return block;
}

// ============================================================
// 2. Markdown 解析器（零依赖实现）
// ============================================================

/**
 * 将 Markdown 文本转换为 HTML
 * 支持：标题、代码块（含自定义属性）、表格、列表、引用、
 *       粗体、斜体、行内代码、链接、图片、水平线、
 *       自定义组件（:::quiz、:::fill-blank、:::code-comparison）
 *
 * @param {string} md - Markdown 源文本
 * @returns {{ html: string, toc: { id: string, text: string, level: number }[] }}
 */
function parseMarkdown(md) {
  const toc = [];
  let editorCount = 0;
  let quizCount = 0;
  let fillBlankCount = 0;

  // 先预处理：提取自定义组件块，替换为占位符
  const componentMap = new Map();
  let componentIndex = 0;

  // 处理 :::quiz 块
  md = md.replace(/:::quiz\s*\{correct="([^"]+)"\}\s*\n([\s\S]*?):::/g, (_, correct, body) => {
    const key = `__COMPONENT_${componentIndex++}__`;
    componentMap.set(key, renderQuiz(correct, body.trim(), ++quizCount));
    return key;
  });

  // 处理 :::fill-blank 块
  md = md.replace(/:::fill-blank\s*\n([\s\S]*?):::/g, (_, body) => {
    const key = `__COMPONENT_${componentIndex++}__`;
    componentMap.set(key, renderFillBlank(body.trim(), ++fillBlankCount));
    return key;
  });

  // 处理 :::code-comparison 块
  md = md.replace(/:::code-comparison\s*\n([\s\S]*?):::/g, (_, body) => {
    const key = `__COMPONENT_${componentIndex++}__`;
    componentMap.set(key, renderCodeComparison(body.trim()));
    return key;
  });

  // 处理 <details> 块（保留原生 HTML）
  // 不需要特殊处理，Markdown 中 <details> 会直接保留

  const lines = md.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 检查是否是组件占位符
    if (line.trim().startsWith('__COMPONENT_') && line.trim().endsWith('__')) {
      const comp = componentMap.get(line.trim());
      if (comp) {
        result.push(comp);
        i++;
        continue;
      }
    }

    // 代码块（```）
    const codeMatch = line.match(/^```(\w*)\s*(.*)?$/);
    if (codeMatch) {
      const lang = codeMatch[1] || '';
      const attrs = codeMatch[2] || '';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // 跳过闭合 ```

      const code = codeLines.join('\n');

      if (lang === 'mermaid') {
        // 转义 <br/> 为 HTML 实体，防止浏览器解析后消失
        const safeCode = code.replace(/<br\s*\/?>/gi, '&lt;br/&gt;');
        result.push(`<div class="mermaid">\n${safeCode}\n</div>`);
      } else if (attrs.includes('{runnable}')) {
        editorCount++;
        const titleMatch = attrs.match(/\{title="([^"]+)"\}/);
        const title = titleMatch ? titleMatch[1] : 'index.js';
        const editorLang = lang === 'js' ? 'javascript' : (lang || 'javascript');
        result.push(renderRunnableEditor(code, editorCount, title, editorLang));
      } else {
        const langClass = lang ? ` class="language-${lang === 'js' ? 'javascript' : lang}"` : '';
        result.push(`<pre><code${langClass}>${escapeHtml(code)}</code></pre>`);
      }
      continue;
    }

    // 水平线
    if (/^---+\s*$/.test(line.trim()) || /^\*\*\*+\s*$/.test(line.trim())) {
      result.push('<hr>');
      i++;
      continue;
    }

    // 标题 (h1 ~ h6)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const cleanText = text.replace(/[`*_\[\]()]/g, '');
      const id = `section-${toc.length}`;

      if (level <= 3) {
        toc.push({ id, text: cleanText, level });
      }

      result.push(`<h${level} id="${id}">${parseInline(text)}</h${level}>`);
      i++;
      continue;
    }

    // 表格
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*[-:]+/.test(lines[i + 1])) {
      const tableResult = parseTable(lines, i);
      result.push(tableResult.html);
      i = tableResult.endIndex;
      continue;
    }

    // HTML 块（<details>、<div> 等）
    if (/^<(details|div|table|aside|section|blockquote|figure)/i.test(line.trim())) {
      const tag = line.trim().match(/^<(\w+)/)[1];
      const htmlLines = [line];
      i++;
      let depth = 1;
      while (i < lines.length && depth > 0) {
        const openMatches = (lines[i].match(new RegExp(`<${tag}`, 'gi')) || []).length;
        const closeMatches = (lines[i].match(new RegExp(`</${tag}`, 'gi')) || []).length;
        depth += openMatches - closeMatches;
        htmlLines.push(lines[i]);
        i++;
      }
      // 对 <details> 中的内容做 markdown 处理
      let htmlBlock = htmlLines.join('\n');
      htmlBlock = processMarkdownInHtmlBlock(htmlBlock);
      result.push(htmlBlock);
      continue;
    }

    // 引用块
    if (line.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && (lines[i].startsWith('>') || (lines[i].trim() !== '' && quoteLines.length > 0 && !lines[i].startsWith('#')))) {
        if (lines[i].startsWith('>')) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
        } else if (lines[i].trim() === '') {
          break;
        } else {
          quoteLines.push(lines[i]);
        }
        i++;
      }
      const quoteContent = quoteLines.join('\n');

      // 检测 callout 类型
      if (quoteContent.includes('🧩') && quoteContent.includes('生活类比')) {
        result.push(`<div class="callout analogy"><p>${parseInline(quoteContent)}</p></div>`);
      } else if (quoteContent.includes('⚠️') || quoteContent.includes('警告') || quoteContent.includes('注意')) {
        result.push(`<div class="callout warning"><p>${parseInline(quoteContent)}</p></div>`);
      } else {
        result.push(`<div class="callout"><p>${parseInline(quoteContent)}</p></div>`);
      }
      continue;
    }

    // 无序列表
    if (/^[-*+]\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^[-*+]\s+/, ''));
        i++;
      }
      const items = listItems.map(item => `<li>${parseInline(item)}</li>`).join('\n');
      result.push(`<ul>\n${items}\n</ul>`);
      continue;
    }

    // 有序列表
    if (/^\d+[.)]\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+[.)]\s+/, ''));
        i++;
      }
      const items = listItems.map(item => `<li>${parseInline(item)}</li>`).join('\n');
      result.push(`<ol>\n${items}\n</ol>`);
      continue;
    }

    // 空行
    if (line.trim() === '') {
      i++;
      continue;
    }

    // 普通段落
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' &&
           !lines[i].startsWith('#') && !lines[i].startsWith('```') &&
           !lines[i].startsWith('>') && !lines[i].startsWith('---') &&
           !lines[i].startsWith('***') &&
           !/^[-*+]\s+/.test(lines[i]) && !/^\d+[.)]\s+/.test(lines[i]) &&
           !lines[i].trim().startsWith('__COMPONENT_') &&
           !lines[i].trim().startsWith('<') &&
           !(lines[i].includes('|') && i + 1 < lines.length && /^\s*\|?\s*[-:]+/.test(lines[i + 1]))) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      result.push(`<p>${parseInline(paraLines.join('\n'))}</p>`);
    }
  }

  return { html: result.join('\n\n'), toc };
}

/**
 * 解析行内 Markdown 语法
 *
 * @param {string} text - 行内文本
 * @returns {string} HTML 文本
 */
function parseInline(text) {
  // 保护行内代码（先替换为占位符）
  const codeSnippets = [];
  text = text.replace(/`([^`]+)`/g, (_, code) => {
    codeSnippets.push(`<code>${escapeHtml(code)}</code>`);
    return `__INLINE_CODE_${codeSnippets.length - 1}__`;
  });

  // 图片
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  // 链接
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--info-color);">$1</a>');
  // 粗体+斜体
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  // 粗体
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // 斜体
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // 换行
  text = text.replace(/\n/g, '<br>');

  // 还原行内代码
  text = text.replace(/__INLINE_CODE_(\d+)__/g, (_, idx) => codeSnippets[parseInt(idx)]);

  return text;
}

/**
 * HTML 特殊字符转义
 *
 * @param {string} str - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// 3. 自定义组件渲染器
// ============================================================

/**
 * 渲染可运行代码编辑器
 *
 * @param {string} code - 代码内容
 * @param {number} index - 编辑器序号
 * @param {string} title - 编辑器标题
 * @param {string} lang - 代码语言（javascript/html/css）
 * @returns {string} HTML 字符串
 */
function renderRunnableEditor(code, index, title, lang = 'javascript') {
  const btnLabel = (lang === 'html' || lang === 'css') ? '👁 预览' : '▶ 运行代码';
  return `<div class="runnable-editor" data-lang="${lang}">
    <div class="editor-header">
        <span class="editor-title">${escapeHtml(title)}</span>
        <button class="btn-run" onclick="runCode('codeEditor${index}', 'console${index}', '${lang}')">${btnLabel}</button>
    </div>
    <div class="editor-container">
        <textarea id="codeEditor${index}" class="editor-textarea" spellcheck="false">${escapeHtml(code)}</textarea>
    </div>
    <div id="console${index}" class="console-output"></div>
</div>`;
}

/**
 * 渲染 Quiz 组件
 *
 * @param {string} correctAnswer - 正确答案（如 "B"）
 * @param {string} body - Quiz 内容（问题 + 选项 + 解析）
 * @param {number} index - Quiz 序号
 * @returns {string} HTML 字符串
 */
function renderQuiz(correctAnswer, body, index) {
  // 提取问题部分
  const questionMatch = body.match(/\*\*\d+\.\s*(.+?)\*\*/);
  const question = questionMatch ? questionMatch[1] : '问题';

  // 提取选项
  const options = [];
  const optionRegex = /^-\s+([A-Z])\)\s*(.+)$/gm;
  let optMatch;
  while ((optMatch = optionRegex.exec(body)) !== null) {
    options.push({ value: optMatch[1], text: optMatch[2] });
  }

  // 提取解析（> 开头的行）
  const explanationMatch = body.match(/>\s*\*?\*?解析\*?\*?[：:]\s*([\s\S]*?)$/m);
  const explanation = explanationMatch ? explanationMatch[1].trim() : '';

  const optionsHtml = options.map(opt =>
    `<div class="quiz-option" data-value="${opt.value}">${opt.value}) ${escapeHtml(opt.text)}</div>`
  ).join('\n');

  return `<div class="quiz-card" data-correct="${correctAnswer}">
    <div class="quiz-question">${parseInline(question)}</div>
    <div class="quiz-options">
        ${optionsHtml}
    </div>
    <div class="quiz-explanation">
        ${parseInline(explanation)}
    </div>
</div>`;
}

/**
 * 渲染代码填空组件
 *
 * @param {string} body - 填空内容
 * @param {number} index - 填空序号
 * @returns {string} HTML 字符串
 */
function renderFillBlank(body, index) {
  const containerId = `fillBlank${index}`;

  // 将 ___答案___ 替换为 input 元素
  let blankIndex = 0;
  const processedBody = body.replace(/___([^_]+)___/g, (_, answer) => {
    blankIndex++;
    return `<input type="text" class="blank-input" data-answer="${escapeHtml(answer)}" placeholder="${blankIndex}">`;
  });

  // 转义 HTML 但保留 input 标签
  const lines = processedBody.split('\n').map(line => {
    // 把非 input 的部分转义
    return line.replace(/([^<]*?)(<input[^>]+>)/g, (_, text, input) => {
      return escapeHtml(text) + input;
    }).replace(/^([^<]+)$/, (_, text) => escapeHtml(text));
  });

  return `<div class="fill-blank-container" id="${containerId}">
    ${lines.join('<br>\n    ')}
    <br><br>
    <button class="btn-run" onclick="checkFillBlanks('${containerId}')" style="display:inline-flex;margin-top:10px;">
        ✓ 检查答案
    </button>
    <button class="btn-run" onclick="showAnswers('${containerId}')" style="display:inline-flex;margin-top:10px;margin-left:8px;color:var(--info-color);border-color:var(--info-color);">
        💡 显示答案
    </button>
</div>`;
}

/**
 * 渲染代码对比组件（DRY 重构双栏）
 *
 * @param {string} body - 对比内容（包含两个代码块）
 * @returns {string} HTML 字符串
 */
function renderCodeComparison(body) {
  const codeBlocks = [];
  const blockRegex = /```\w*\s*\{title="([^"]+)"\}\s*\n([\s\S]*?)```/g;
  let blockMatch;

  while ((blockMatch = blockRegex.exec(body)) !== null) {
    codeBlocks.push({ title: blockMatch[1], code: blockMatch[2].trim() });
  }

  if (codeBlocks.length < 2) {
    // 如果解析失败，回退为普通代码块
    return `<pre><code>${escapeHtml(body)}</code></pre>`;
  }

  const panelClass1 = codeBlocks[0].title.includes('初版') || codeBlocks[0].title.includes('Naive') ? 'method1' : 'method2';
  const panelClass2 = codeBlocks[1].title.includes('重构') || codeBlocks[1].title.includes('Refactored') ? 'method2' : 'method1';

  return `<div class="code-comparison">
    <div class="code-panel">
        <div class="panel-header ${panelClass1}">${escapeHtml(codeBlocks[0].title)}</div>
        <pre style="margin:0; border:none; border-radius:0;"><code class="language-javascript">${escapeHtml(codeBlocks[0].code)}</code></pre>
    </div>
    <div class="code-panel">
        <div class="panel-header ${panelClass2}">${escapeHtml(codeBlocks[1].title)}</div>
        <pre style="margin:0; border:none; border-radius:0;"><code class="language-javascript">${escapeHtml(codeBlocks[1].code)}</code></pre>
    </div>
</div>`;
}

// ============================================================
// 4. 表格解析
// ============================================================

/**
 * 解析 Markdown 表格
 *
 * @param {string[]} lines - 全部行
 * @param {number} startIndex - 表格起始行
 * @returns {{ html: string, endIndex: number }}
 */
function parseTable(lines, startIndex) {
  let i = startIndex;

  // 解析表头
  const headerCells = parseTrCells(lines[i]);
  i++; // 跳过分隔线
  i++;

  // 解析表体
  const bodyRows = [];
  while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
    bodyRows.push(parseTrCells(lines[i]));
    i++;
  }

  const headerHtml = headerCells.map(c => `<th>${parseInline(c)}</th>`).join('');
  const bodyHtml = bodyRows.map(row =>
    `<tr>${row.map(c => `<td>${parseInline(c)}</td>`).join('')}</tr>`
  ).join('\n');

  return {
    html: `<table>
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
</table>`,
    endIndex: i,
  };
}

/**
 * 解析表格行的单元格
 *
 * @param {string} line - 表格行文本
 * @returns {string[]} 单元格内容数组
 */
function parseTrCells(line) {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

// ============================================================
// 5. HTML 组装
// ============================================================

/**
 * 从 Markdown 文件的标题和元信息中提取章节号
 *
 * @param {string} md - Markdown 文本
 * @returns {string} 章节号（如 "02"）
 */
function extractSection(md) {
  const match = md.match(/第\s*(\d+)\s*章/);
  return match ? match[1].padStart(2, '0') : '00';
}

/**
 * 从 Markdown 文件的 h1 标题中提取课题名
 *
 * @param {string} md - Markdown 文本
 * @returns {string} 课题名
 */
function extractTitle(md) {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '教程';
}

/**
 * 将解析后的内容组装为完整 HTML 页面
 *
 * @param {string} contentHtml - 主体内容 HTML
 * @param {{ id: string, text: string, level: number }[]} toc - 目录数据
 * @param {string} title - 页面标题
 * @param {string} section - 章节号
 * @param {{ css: string, scripts: string }} template - 模板数据
 * @returns {string} 完整 HTML 文档
 */
function assembleHtml(contentHtml, toc, title, section, template) {
  // 生成侧边栏目录
  const tocHtml = toc
    .filter(item => item.level <= 2)
    .map((item, idx) => {
      const isActive = idx === 0 ? ' active' : '';
      return `            <a href="#${item.id}" class="nav-item${isActive}">${item.text}</a>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <!-- Prism.js CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
    <style>
${template.css}
    </style>
</head>
<body>

<div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-title">第 ${section} 章 / 进度</div>
            <div class="progress-container">
                <div class="progress-bar" id="progressBar"></div>
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary); text-align: right;" id="progressText">0%</div>
        </div>
        <nav id="toc">
${tocHtml}
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
${contentHtml}
    </main>
</div>

${template.scripts}

</body>
</html>`;
}

// ============================================================
// 6. 文件转换主逻辑
// ============================================================

// ============================================================
// 6a. 转换质量验证
// ============================================================

/**
 * 检查转换后的 HTML 内容中是否残留未解析的 Markdown 语法
 *
 * @param {string} html - 主体内容 HTML（不含模板外壳）
 * @param {string} filename - 源文件名（用于报告）
 * @returns {string[]} 警告信息数组
 */
function validateHtml(html, filename) {
  const warnings = [];

  // 从 HTML 中提取纯文本（去掉所有标签内部内容，保留标签间文本）
  // 但排除 <pre>/<code>/<textarea>/<div class="mermaid"> 等内容块
  const strippedHtml = html
    .replace(/<pre[\s\S]*?<\/pre>/gi, '')
    .replace(/<code[\s\S]*?<\/code>/gi, '')
    .replace(/<textarea[\s\S]*?<\/textarea>/gi, '')
    .replace(/<div class="mermaid">[\s\S]*?<\/div>/gi, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '');

  // 1. 检查残留的 Markdown 表格语法（|xxx|xxx| 模式，非 HTML 属性）
  const tableLines = strippedHtml.match(/^[^<]*\|[^|]+\|[^|]+\|/gm);
  if (tableLines) {
    // 排除已在 <table> 内的内容
    const outsideTable = tableLines.filter(line => !/<t[hdr]/.test(line));
    if (outsideTable.length > 0) {
      warnings.push(`[${filename}] 残留 Markdown 表格语法（${outsideTable.length} 行）`);
    }
  }

  // 2. 检查残留的 Markdown 标题（## / ### 等，排除 HTML 注释）
  const headings = strippedHtml.match(/(?:^|\n)\s*#{1,6}\s+\S/gm);
  if (headings) {
    warnings.push(`[${filename}] 残留 Markdown 标题语法（${headings.length} 处）`);
  }

  // 3. 检查残留的代码块围栏（```）
  const fences = strippedHtml.match(/(?:^|\n)\s*```/gm);
  if (fences) {
    warnings.push(`[${filename}] 残留代码块围栏 \`\`\`（${fences.length} 处）`);
  }

  // 4. 检查残留的自定义组件标记（:::quiz / :::fill-blank / :::code-comparison / :::）
  const components = strippedHtml.match(/(?:^|\n)\s*:::/gm);
  if (components) {
    warnings.push(`[${filename}] 残留自定义组件标记 :::（${components.length} 处）`);
  }

  // 5. 检查残留的 Markdown 粗体标记 **...**
  const bolds = strippedHtml.match(/\*\*[^*]+\*\*/g);
  if (bolds && bolds.length > 0) {
    warnings.push(`[${filename}] 残留 Markdown 粗体 **...**（${bolds.length} 处）`);
  }

  return warnings;
}

/**
 * 将单个 Markdown 文件转换为 HTML 文件
 *
 * @param {string} mdPath - Markdown 文件路径
 * @param {string} [outputPath] - 输出路径（可选，默认同目录同名 .html）
 * @returns {string} 输出文件路径
 */
function convertFile(mdPath, outputPath) {
  const md = fs.readFileSync(mdPath, 'utf-8');
  const template = loadTemplate();

  const title = extractTitle(md);
  const section = extractSection(md);
  const { html: contentHtml, toc } = parseMarkdown(md);
  const fullHtml = assembleHtml(contentHtml, toc, title, section, template);

  if (!outputPath) {
    outputPath = mdPath.replace(/\.md$/, '.html');
  }

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, fullHtml, 'utf-8');

  // 转换后质量检查
  const warnings = validateHtml(contentHtml, path.basename(mdPath));
  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`  ⚠️  ${w}`));
  }

  return outputPath;
}

/**
 * 批量转换目录下所有 .md 文件
 *
 * @param {string} dirPath - 目录路径
 * @returns {string[]} 输出文件路径数组
 */
function batchConvert(dirPath, outputDir) {
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.md') && f !== 'index.md' && f !== 'README.md')
    .sort();

  const results = [];
  for (const filename of files) {
    const mdPath = path.join(dirPath, filename);
    const htmlFilename = filename.replace(/\.md$/, '.html');
    const htmlPath = outputDir
      ? path.join(outputDir, htmlFilename)
      : path.join(dirPath, htmlFilename);
    const outPath = convertFile(mdPath, htmlPath);
    results.push(outPath);
    console.log(`✅ ${filename} → ${path.basename(outPath)}`);
  }
  return results;
}

/**
 * 全量转换：遍历 text 目录下所有章节子目录
 *
 * @param {string} textDir - text 根目录
 * @returns {string[]} 输出文件路径数组
 */
function convertAll(textDir) {
  const results = [];

  // 先处理根目录的 .md 文件
  const rootMds = fs.readdirSync(textDir)
    .filter(f => f.endsWith('.md') && f !== 'index.md' && f !== 'README.md');

  for (const filename of rootMds) {
    const mdPath = path.join(textDir, filename);
    const outPath = convertFile(mdPath);
    results.push(outPath);
    console.log(`✅ ${filename} → ${path.basename(outPath)}`);
  }

  // 再处理子目录
  const subdirs = fs.readdirSync(textDir)
    .filter(f => {
      const fullPath = path.join(textDir, f);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort();

  for (const subdir of subdirs) {
    const subPath = path.join(textDir, subdir);
    const subMds = fs.readdirSync(subPath)
      .filter(f => f.endsWith('.md') && f !== 'index.md' && f !== 'README.md');

    if (subMds.length > 0) {
      console.log(`\n📂 ${subdir}/`);
      for (const filename of subMds) {
        const mdPath = path.join(subPath, filename);
        const outPath = convertFile(mdPath);
        results.push(outPath);
        console.log(`  ✅ ${filename} → ${path.basename(outPath)}`);
      }
    }
  }

  return results;
}

// ============================================================
// 6.5 生成/更新目录索引
// ============================================================

/**
 * 扫描 text 目录，生成或更新 index.md
 *
 * @param {string} textDir - text 根目录 (如 d:\\JavaScript\\text)
 */
function updateIndexMd(textDir) {
  const indexPath = path.join(textDir, 'index.md');
  const sections = new Map(); // key: 章节号, value: [{ filepath, title }]

  // 1. 扫描所有章节目录
  const subdirs = fs.readdirSync(textDir)
    .filter(f => fs.statSync(path.join(textDir, f)).isDirectory() && /^\\d{2}$/.test(f))
    .sort();

  for (const subdir of subdirs) {
    const subPath = path.join(textDir, subdir);
    const htmlFiles = fs.readdirSync(subPath)
      .filter(f => f.endsWith('.html'))
      .sort();

    if (htmlFiles.length === 0) continue;

    const links = [];
    for (const file of htmlFiles) {
      // 从文件名中提取标题，例如: 002_Hello_World.html -> Hello World
      const match = file.match(/^\\d{3}_(.+)\\.html$/);
      const title = match ? match[1].replace(/_/g, ' ') : file.replace('.html', '');
      links.push({ file: `./${subdir}/${file}`, title });
    }
    sections.set(subdir, links);
  }

  // 2. 生成 index.md 内容
  let indexContent = `# JavaScript 课程教程索引\\n\\n`;

  for (const [section, links] of sections.entries()) {
    indexContent += `## 第 ${section} 章\\n`;
    links.forEach((link, idx) => {
      indexContent += `${idx + 1}. <a href="${link.file}">${escapeHtml(link.title)}</a>\\n`;
    });
    indexContent += `\\n`;
  }

  // 3. 写入文件
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  console.log(`\\n📝 已更新目录索引: index.md`);
}

// ============================================================
// 7. CLI 入口
// ============================================================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Markdown → HTML 教程转换器');
    console.error('');
    console.error('用法:');
    console.error('  单文件:  node md-to-html.js "path/to/tutorial.md"');
    console.error('  批量:    node md-to-html.js "path/to/chapter_dir" --batch');
    console.error('  全量:    node md-to-html.js "path/to/text_dir" --all');
    process.exit(1);
  }

  const targetPath = path.resolve(args[0]);
  const isBatch = args.includes('--batch');
  const isAll = args.includes('--all');

  // 解析 --output 参数
  const outputIdx = args.indexOf('--output');
  const outputDir = outputIdx !== -1 && args[outputIdx + 1]
    ? path.resolve(args[outputIdx + 1])
    : null;

  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 已创建输出目录: ${outputDir}`);
  }

  if (isAll) {
    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
      console.error(`错误: "${targetPath}" 不是有效的目录`);
      process.exit(1);
    }
    const results = convertAll(targetPath);
    console.log(`\n✨ 共转换 ${results.length} 个文件`);
    updateIndexMd(targetPath);
  } else if (isBatch) {
    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
      console.error(`错误: "${targetPath}" 不是有效的目录`);
      process.exit(1);
    }
    const results = batchConvert(targetPath, outputDir);
    console.log(`\n✨ 共转换 ${results.length} 个文件`);
    // 假设 batch 的 targetPath 是 text/02 这样的子目录，向上一层找 text 目录
    const parentDir = path.dirname(targetPath);
    if (path.basename(parentDir) === 'text' || fs.existsSync(path.join(parentDir, 'index.md'))) {
       updateIndexMd(parentDir);
    }
  } else {
    if (!fs.existsSync(targetPath)) {
      console.error(`错误: 文件 "${targetPath}" 不存在`);
      process.exit(1);
    }
    const outPath = convertFile(targetPath, outputDir ? path.join(outputDir, path.basename(targetPath).replace(/\.md$/, '.html')) : undefined);
    console.log(`✅ ${path.basename(targetPath)} → ${path.basename(outPath)}`);
  }
}

module.exports = { convertFile, batchConvert, convertAll, parseMarkdown };
