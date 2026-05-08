import JSZip from 'jszip';
import RNFS from 'react-native-fs';
import { Chapter } from '../types';

export interface EpubMetadata {
  title: string;
  author: string;
  coverPath?: string;
}

function matchAll(regex: RegExp, text: string): string[] {
  const results: string[] = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    results.push(m[1]);
  }
  return results;
}

function getAttr(tag: string, attr: string): string {
  const re = new RegExp(attr + `\\s*=\\s*["']([^"']*)["']`, 'i');
  const m = tag.match(re);
  return m ? m[1] : '';
}

function getTextContent(xml: string, tagName: string): string {
  const re = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'i');
  const m = xml.match(re);
  return m ? m[1].trim() : '';
}

export async function parseEpub(filePath: string): Promise<{ metadata: EpubMetadata; chapters: Chapter[] }> {
  const base64 = await RNFS.readFile(filePath, 'base64');
  const zip = await JSZip.loadAsync(base64, { base64: true });

  // Parse container.xml to find OPF path
  const containerFile = zip.file('META-INF/container.xml');
  if (!containerFile) throw new Error('Invalid EPUB: no container.xml');

  const containerContent = await containerFile.async('string');
  const opfPathMatch = containerContent.match(/full-path\s*=\s*["']([^"']*)["']/i);
  const opfPath = opfPathMatch ? opfPathMatch[1] : '';
  if (!opfPath) throw new Error('Invalid EPUB: no rootfile in container.xml');

  // Parse OPF
  const opfFile = zip.file(opfPath);
  if (!opfFile) throw new Error('OPF file not found: ' + opfPath);

  const opfContent = await opfFile.async('string');
  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

  // Extract metadata
  const title = getTextContent(opfContent, 'dc:title');
  const author = getTextContent(opfContent, 'dc:creator');

  // Extract cover image reference
  let coverHref = '';
  const coverMetaMatch = opfContent.match(/<meta\s+[^>]*name\s*=\s*["']cover["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*\/?>/i)
    || opfContent.match(/<meta\s+[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']cover["'][^>]*\/?>/i);
  if (coverMetaMatch) {
    const coverId = coverMetaMatch[1];
    const manifestRe = new RegExp(`<item\\s+[^>]*id\\s*=\\s*["']${coverId}["'][^>]*>`, 'i');
    const manifestMatch = opfContent.match(manifestRe);
    if (manifestMatch) {
      coverHref = getAttr(manifestMatch[0], 'href');
    }
  }

  // Extract spine item IDs in order
  const spineIdRefs: string[] = [];
  const itemRefRe = /<itemref\s+[^>]*idref\s*=\s*["']([^"']*)["'][^>]*\/?>/gi;
  let refMatch;
  while ((refMatch = itemRefRe.exec(opfContent)) !== null) {
    spineIdRefs.push(refMatch[1]);
  }

  // Build manifest map: id -> { href, mediaType }
  const manifestMap = new Map<string, { href: string; mediaType: string }>();
  const itemRe = /<item\s+[^>]*id\s*=\s*["']([^"']*)["'][^>]*>/gi;
  let itemMatch;
  while ((itemMatch = itemRe.exec(opfContent)) !== null) {
    const tag = itemMatch[0];
    const id = getAttr(tag, 'id');
    const href = getAttr(tag, 'href');
    const mediaType = getAttr(tag, 'media-type');
    if (id) manifestMap.set(id, { href, mediaType });
  }

  // Build chapters from spine
  const chapters: Chapter[] = [];
  let chapterIndex = 0;

  for (const id of spineIdRefs) {
    const item = manifestMap.get(id);
    if (!item) continue;
    if (!item.mediaType.includes('html') && !item.mediaType.includes('xhtml')) continue;

    const href = opfDir + decodeURIComponent(item.href);

    // Try to extract chapter title from content
    let chapterTitle = decodeURIComponent(item.href).replace(/\.x?html?$/i, '');
    try {
      const chapterFile = zip.file(href);
      if (chapterFile) {
        const chapterContent = await chapterFile.async('string');
        const hMatch = chapterContent.match(/<h[1-3][^>]*>([^<]*)<\/h[1-3]>/i)
          || chapterContent.match(/<title>([^<]*)<\/title>/i);
        if (hMatch && hMatch[1].trim()) {
          chapterTitle = hMatch[1].trim();
        }
      }
    } catch {
      // Fall back to filename
    }

    chapters.push({
      index: chapterIndex,
      title: chapterTitle,
      startOffset: 0,
      endOffset: 0,
      href,
    });
    chapterIndex++;
  }

  // Save cover image
  let savedCoverPath: string | undefined;
  if (coverHref) {
    try {
      const fullCoverPath = opfDir + decodeURIComponent(coverHref);
      const coverFile = zip.file(fullCoverPath);
      if (coverFile) {
        const coverData = await coverFile.async('base64');
        const ext = coverHref.split('.').pop() || 'jpg';
        await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/covers`);
        const localPath = `${RNFS.DocumentDirectoryPath}/covers/${Date.now()}.${ext}`;
        await RNFS.writeFile(localPath, coverData, 'base64');
        savedCoverPath = 'file://' + localPath;
      }
    } catch {
      // Cover extraction failed, skip
    }
  }

  return {
    metadata: { title, author, coverPath: savedCoverPath },
    chapters,
  };
}
