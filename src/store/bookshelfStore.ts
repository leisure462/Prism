import { create } from 'zustand';
import { Book, Chapter } from '../types';

interface BookshelfState {
  books: Book[];
  currentBookId: string | null;
  chapters: Chapter[];
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  updateBookProgress: (id: string, position: number, chapter: number) => void;
  setCurrentBook: (id: string | null) => void;
  setChapters: (chapters: Chapter[]) => void;
}

export const useBookshelfStore = create<BookshelfState>((set) => ({
  books: [],
  currentBookId: null,
  chapters: [],

  addBook: (book) =>
    set((state) => ({
      books: [...state.books.filter((b) => b.id !== book.id), book],
    })),

  removeBook: (id) =>
    set((state) => ({
      books: state.books.filter((b) => b.id !== id),
      currentBookId: state.currentBookId === id ? null : state.currentBookId,
    })),

  updateBookProgress: (id, position, chapter) =>
    set((state) => ({
      books: state.books.map((b) =>
        b.id === id
          ? { ...b, lastReadPosition: position, currentChapter: chapter, lastReadAt: Date.now() }
          : b
      ),
    })),

  setCurrentBook: (id) => set({ currentBookId: id }),
  setChapters: (chapters) => set({ chapters }),
}));
