import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const storage = new MMKV();

export function getString(key: string): string | undefined {
  return storage.getString(key);
}

export function setString(key: string, value: string): void {
  storage.set(key, value);
}

export function getNumber(key: string): number | undefined {
  return storage.getNumber(key);
}

export function setNumber(key: string, value: number): void {
  storage.set(key, value);
}

export function getBoolean(key: string): boolean | undefined {
  return storage.getBoolean(key);
}

export function setBoolean(key: string, value: boolean): void {
  storage.set(key, value);
}

export function remove(key: string): void {
  storage.delete(key);
}

export const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => getString(name) ?? null,
  setItem: (name: string, value: string): void => setString(name, value),
  removeItem: (name: string): void => remove(name),
};
