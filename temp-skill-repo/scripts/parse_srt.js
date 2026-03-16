/**
 * SRT 字幕解析器
 *
 * 功能：将 .srt 字幕文件解析为干净的纯文本段落。
 * - 去除序号行和时间轴行
 * - 智能合并跨行碎片化的断句
 * - 支持单文件和批量目录模式
 *
 * 用法：
 *   单文件: node parse_srt.js "path/to/file.srt"
 *   批量:   node parse_srt.js "path/to/chapter_dir" --batch
 *   批量+保存: node parse_srt.js "path/to/chapter_dir" --batch --output "path/to/output_dir"
 *
 * @module parse_srt
 */

const fs = require('fs');
const path = require('path');

/**
 * 解析单个 SRT 文件，返回合并断句后的纯文本
 *
 * @param {string} filePath - SRT 文件绝对路径
 * @returns {string} 合并后的纯文本（段落间以双换行分隔）
 * @throws {Error} 文件不存在或读取失败时抛出异常
 */
function parseSRT(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  const textLines = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // 跳过空行
    if (line === '') {
      i++;
      continue;
    }

    // 跳过纯数字行（字幕序号）
    if (/^\d+$/.test(line)) {
      i++;
      continue;
    }

    // 跳过时间轴行（00:00:01,380 --> 00:00:02,550）
    if (/^\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}$/.test(line)) {
      i++;
      continue;
    }

    // 收集文本行
    textLines.push(line);
    i++;
  }

  // 智能断句合并：将碎片化的句子还原为完整段落
  return mergeFragments(textLines);
}

/**
 * 智能合并碎片化的字幕文本为完整段落
 *
 * SRT 字幕通常每行只有几个单词，一句话被拆分为多行。
 * 本函数将连续的文本行合并，以句末标点（. ? ! :）作为段落分界。
 *
 * @param {string[]} lines - 原始文本行数组
 * @returns {string} 合并后的段落文本
 */
function mergeFragments(lines) {
  if (lines.length === 0) return '';

  const paragraphs = [];
  let current = '';

  for (const line of lines) {
    if (current === '') {
      current = line;
    } else {
      // 如果上一行末尾不是句末标点，则合并到同一段
      current += ' ' + line;
    }

    // 句末标点检测：句号、问号、感叹号、冒号后跟引号等
    if (/[.?!]["']?\s*$/.test(line) || /[.?!]\s*$/.test(current)) {
      paragraphs.push(current.trim());
      current = '';
    }
  }

  // 处理末尾未结束的文本
  if (current.trim()) {
    paragraphs.

push(current.trim());
  }

  return paragraphs.join('\n\n');
}

/**
 * 批量解析目录下所有 .srt 文件
 *
 * @param {string} dirPath - 章节目录路径
 * @returns {{ filename: string, text: string }[]} 解析结果数组（按文件名排序）
 */
function batchParse(dirPath) {
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.srt'))
    .sort((a, b) => {
      // 按文件名开头的数字排序（如 001, 002, 003...）
      const numA = parseInt(a.match(/^(\d+)/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/^(\d+)/)?.[1] || '0', 10);
      return numA - numB;
    });

  return files.map(filename => ({
    filename,
    text: parseSRT(path.join(dirPath, filename)),
  }));
}

// === CLI 入口 ===
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('用法:');
    console.error('  单文件: node parse_srt.js "file.srt"');
    console.error('  批量:   node parse_srt.js "chapter_dir" --batch');
    console.error('  批量+保存: node parse_srt.js "chapter_dir" --batch --output "output_dir"');
    process.exit(1);
  }

  const targetPath = path.resolve(args[0]);
  const isBatch = args.includes('--batch');
  const outputIndex = args.indexOf('--output');
  const outputDir = outputIndex !== -1 ? path.resolve(args[outputIndex + 1]) : null;

  if (isBatch) {
    // 批量模式：解析目录下所有 .srt 文件
    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
      console.error(`错误: "${targetPath}" 不是有效的目录`);
      process.exit(1);
    }

    const results = batchParse(targetPath);

    if (outputDir) {
      // 保存到文件
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      for (const { filename, text } of results) {
        const outName = filename.replace(/\.en\.srt$/, '.txt').replace(/\.srt$/, '.txt');
        const outPath = path.join(outputDir, outName);
        fs.writeFileSync(outPath, text, 'utf-8');
        console.log(`✅ ${filename} → ${outName}`);
      }
      console.log(`\n共处理 ${results.length} 个文件，输出至: ${outputDir}`);
    } else {
      // 输出到 stdout
      for (const { filename, text } of results) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📄 ${filename}`);
        console.log('='.repeat(60));
        console.log(text);
      }
    }
  } else {
    // 单文件模式
    if (!fs.existsSync(targetPath)) {
      console.error(`错误: 文件 "${targetPath}" 不存在`);
      process.exit(1);
    }

    const text = parseSRT(targetPath);
    console.log(text);
  }
}

module.exports = { parseSRT, batchParse, mergeFragments };
