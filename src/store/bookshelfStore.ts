import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Book, Chapter, Collection } from '../types';
import { zustandStorage } from '../utils/storage';

interface BookshelfState {
  books: Book[];
  currentBookId: string | null;
  bookChapters: Record<string, Chapter[]>;
  collections: Collection[];
  sortBy: 'title' | 'addedAt' | 'lastReadAt';
  sortOrder: 'asc' | 'desc';
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  updateBookProgress: (id: string, position: number, chapter: number, epubCfi?: string) => void;
  setCurrentBook: (id: string | null) => void;
  setChaptersForBook: (bookId: string, chapters: Chapter[]) => void;
  getChapters: (bookId: string) => Chapter[];
  addCollection: (name: string) => void;
  removeCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addBookToCollection: (collectionId: string, bookId: string) => void;
  removeBookFromCollection: (collectionId: string, bookId: string) => void;
  setSortBy: (sortBy: BookshelfState['sortBy']) => void;
  setSortOrder: (order: BookshelfState['sortOrder']) => void;
  getSortedBooks: () => Book[];
}

export const useBookshelfStore = create<BookshelfState>()(
  persist(
    (set, get) => ({
      books: [],
      currentBookId: null,
      bookChapters: {},
      collections: [],
      sortBy: 'addedAt',
      sortOrder: 'desc',

      addBook: (book) =>
        set((state) => ({
          books: [...state.books.filter((b) => b.id !== book.id), book],
        })),

      removeBook: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.bookChapters;
          return {
            books: state.books.filter((b) => b.id !== id),
            currentBookId: state.currentBookId === id ? null : state.currentBookId,
            bookChapters: rest,
            collections: state.collections.map((c) => ({
              ...c,
              bookIds: c.bookIds.filter((bid) => bid !== id),
            })),
          };
        }),

      updateBookProgress: (id, position, chapter, epubCfi) =>
        set((state) => ({
          books: state.books.map((b) =>
            b.id === id
              ? {
                  ...b,
                  lastReadPosition: position,
                  currentChapter: chapter,
                  lastReadAt: Date.now(),
                  ...(epubCfi !== undefined ? { epubCfi } : {}),
                }
              : b
          ),
        })),

      setCurrentBook: (id) => set({ currentBookId: id }),

      setChaptersForBook: (bookId, chapters) =>
        set((state) => ({
          bookChapters: { ...state.bookChapters, [bookId]: chapters },
        })),

      getChapters: (bookId) => get().bookChapters[bookId] || [],

      addCollection: (name) =>
        set((state) => ({
          collections: [
            ...state.collections,
            { id: Date.now().toString(), name, bookIds: [], createdAt: Date.now() },
          ],
        })),

      removeCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        })),

      renameCollection: (id, name) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        })),

      addBookToCollection: (collectionId, bookId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId && !c.bookIds.includes(bookId)
              ? { ...c, bookIds: [...c.bookIds, bookId] }
              : c
          ),
        })),

      removeBookFromCollection: (collectionId, bookId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, bookIds: c.bookIds.filter((bid) => bid !== bookId) }
              : c
          ),
        })),

      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),

      getSortedBooks: () => {
        const { books, sortBy, sortOrder } = get();
        const sorted = [...books].sort((a, b) => {
          let cmp = 0;
          switch (sortBy) {
            case 'title':
              cmp = a.title.localeCompare(b.title, 'zh');
              break;
            case 'addedAt':
              cmp = a.addedAt - b.addedAt;
              break;
            case 'lastReadAt':
              cmp = (a.lastReadAt || 0) - (b.lastReadAt || 0);
              break;
          }
          return sortOrder === 'desc' ? -cmp : cmp;
        });
        return sorted;
      },
    }),
    {
      name: 'prism-bookshelf',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        books: state.books,
        bookChapters: state.bookChapters,
        collections: state.collections,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
