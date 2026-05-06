import { ReaderTheme } from '../types';

export const themes: Record<string, ReaderTheme> = {
  vellum: {
    name: '宣纸',
    background: '#faf9f5',
    text: '#141413',
    secondaryText: '#73726c',
    accent: '#d97757',
    divider: '#dedcd1',
    surface: '#ffffff',
    statusBar: 'dark',
  },
  ink: {
    name: '墨纸',
    background: '#121212',
    text: '#e0e0e0',
    secondaryText: '#9e9e9e',
    accent: '#e07a5f',
    divider: '#2c2c2c',
    surface: '#1e1e1e',
    statusBar: 'light',
  },
  parchment: {
    name: '羊皮',
    background: '#e8e0c8',
    text: '#2c2c2c',
    secondaryText: '#6b6b6b',
    accent: '#c45c3e',
    divider: '#d4cbb0',
    surface: '#f0ead8',
    statusBar: 'dark',
  },
  azure: {
    name: '青玉',
    background: '#f0f4f8',
    text: '#141413',
    secondaryText: '#73726c',
    accent: '#ccdbe8',
    divider: '#e0e8f0',
    surface: '#ffffff',
    statusBar: 'dark',
  },
};

export const fontOptions = [
  { label: '系统默认', value: 'System' },
  { label: 'Lora (Serif)', value: 'Lora' },
  { label: 'Inter (Sans)', value: 'Inter' },
];
