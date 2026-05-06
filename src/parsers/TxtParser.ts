import { Chapter } from '../types';

const CHAPTER_PATTERNS = [
  /^\s*第[一二三四五六七八九十百千万零\d]+章.*$/,
  /^\s*第\s*\d+\s*章.*$/,
  /^\s*Chapter\s*\d+.*/i,
  /^\s*\d+\.\s*.+/,
  /^\s*【.+】\s*$/,
  /^\s*正文.*/,
];

export function parseChapters(text: string): Chapter[] {
  const lines = text.split('\n');
  const chapters: Chapter[] = [];
  let currentOffset = 0;

  lines.forEach((line, index) => {
    const isChapter = CHAPTER_PATTERNS.some((pattern) => pattern.test(line));
    if (isChapter) {
      if (chapters.length > 0) {
        chapters[chapters.length - 1].endOffset = currentOffset;
      }
      chapters.push({
        index: chapters.length,
        title: line.trim(),
        startOffset: currentOffset,
        endOffset: text.length,
      });
    }
    currentOffset += line.length + 1; // +1 for newline
  });

  if (chapters.length === 0) {
    chapters.push({
      index: 0,
      title: '全文',
      startOffset: 0,
      endOffset: text.length,
    });
  }

  return chapters;
}

export function getChapterContent(text: string, chapter: Chapter): string {
  return text.slice(chapter.startOffset, chapter.endOffset);
}
