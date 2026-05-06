export interface Book {
  id: string;
  title: string;
  author: string;
  coverUri?: string;
  filePath: string;
  format: 'txt' | 'epub' | 'pdf';
  lastReadPosition: number;
  totalChapters: number;
  currentChapter: number;
  addedAt: number;
  lastReadAt?: number;
}

export interface Chapter {
  index: number;
  title: string;
  startOffset: number;
  endOffset: number;
}

export interface ReaderTheme {
  name: string;
  background: string;
  text: string;
  secondaryText: string;
  accent: string;
  divider: string;
  surface: string;
  statusBar: 'dark' | 'light';
}

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  marginHorizontal: number;
  marginVertical: number;
  fontFamily: string;
  theme: string;
  keepScreenOn: boolean;
  showStatusBar: boolean;
  flipType: 'slide' | 'tap' | 'volume';
}
