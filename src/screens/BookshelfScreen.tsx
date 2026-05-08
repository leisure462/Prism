import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookshelfStore } from '../store/bookshelfStore';
import BookCard from '../components/BookCard';
import BookActionSheet from '../components/BookActionSheet';
import CollectionModal from '../components/CollectionModal';
import IconButton from '../components/IconButton';
import { parseChapters } from '../parsers/TxtParser';
import { parseEpub } from '../parsers/EpubParser';

export default function BookshelfScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    books,
    collections,
    addBook,
    removeBook,
    setCurrentBook,
    setChaptersForBook,
    addCollection,
    addBookToCollection,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    getSortedBooks,
  } = useBookshelfStore();

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [actionSheetBookId, setActionSheetBookId] = useState<string | null>(null);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);

  const filteredBooks = useMemo(() => {
    let result = getSortedBooks();
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    if (activeCollection) {
      const col = collections.find((c) => c.id === activeCollection);
      if (col) {
        result = result.filter((b) => col.bookIds.includes(b.id));
      }
    }
    return result;
  }, [books, collections, activeCollection, searchQuery, sortBy, sortOrder]);

  const actionBook = useMemo(
    () => books.find((b) => b.id === actionSheetBookId),
    [books, actionSheetBookId]
  );

  const importBook = useCallback(async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.plainText, DocumentPicker.types.allFiles],
      });

      if (!res.uri) return;

      const fileName = res.name || '未知书籍';
      const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';

      if (ext !== 'txt' && ext !== 'epub') {
        Alert.alert('暂不支持该格式', '目前仅支持 TXT 和 EPUB');
        return;
      }

      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.copyFile(res.uri, destPath);

      let chapters;
      let bookTitle = fileName.replace(/\.[^.]+$/, '');
      let bookAuthor = '';
      let coverUri: string | undefined;

      if (ext === 'txt') {
        const content = await RNFS.readFile(destPath, 'utf8');
        chapters = parseChapters(content);
      } else {
        const result = await parseEpub(destPath);
        chapters = result.chapters;
        bookTitle = result.metadata.title || bookTitle;
        bookAuthor = result.metadata.author;
        coverUri = result.metadata.coverPath;
      }

      if (chapters.length === 0) {
        chapters = [{ index: 0, title: '全文', startOffset: 0, endOffset: 0 }];
      }

      const bookId = Date.now().toString();

      addBook({
        id: bookId,
        title: bookTitle,
        author: bookAuthor,
        coverUri,
        filePath: destPath,
        format: ext as 'txt' | 'epub',
        lastReadPosition: 0,
        totalChapters: chapters.length,
        currentChapter: 0,
        addedAt: Date.now(),
      });

      setChaptersForBook(bookId, chapters);
      setCurrentBook(bookId);
      navigation.navigate('Reader', { bookId });
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) return;
      Alert.alert('导入失败', err.message);
    }
  }, [addBook, setChaptersForBook, setCurrentBook, navigation]);

  const openBook = useCallback((bookId: string) => {
    setCurrentBook(bookId);
    navigation.navigate('Reader', { bookId });
  }, [setCurrentBook, navigation]);

  const handleDeleteBook = useCallback(() => {
    if (!actionBook) return;
    Alert.alert('删除书籍', `确定要删除「${actionBook.title}」吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await RNFS.unlink(actionBook.filePath);
          } catch {
            // File may already be deleted
          }
          removeBook(actionBook.id);
          setActionSheetBookId(null);
        },
      },
    ]);
  }, [actionBook, removeBook]);

  const handleAddToCollection = useCallback(
    (collectionId: string) => {
      if (actionSheetBookId) {
        addBookToCollection(collectionId, actionSheetBookId);
      }
    },
    [actionSheetBookId, addBookToCollection]
  );

  const handleCreateCollection = useCallback(
    (name: string) => {
      addCollection(name);
    },
    [addCollection]
  );

  const sortLabels: Record<string, string> = {
    title: '按标题',
    addedAt: '按添加时间',
    lastReadAt: '按最近阅读',
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Prism</Text>
        <View style={styles.headerActions}>
          <IconButton label="搜索" onPress={() => setSearchVisible(!searchVisible)} color="#3d3d3a" />
          <IconButton label="排序" onPress={() => {
            const options = Object.keys(sortLabels).map((key) => ({
              text: sortLabels[key] + (sortBy === key ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : ''),
              onPress: () => {
                if (sortBy === key) {
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                } else {
                  setSortBy(key as any);
                  setSortOrder('desc');
                }
              },
            }));
            options.push({ text: '取消', style: 'cancel' as const });
            Alert.alert('排序方式', undefined, options as any);
          }} color="#3d3d3a" />
          <IconButton label="设置" onPress={() => navigation.navigate('Settings')} color="#3d3d3a" />
          <IconButton label="导入" onPress={importBook} color="#d97757" />
        </View>
      </View>

      {/* Search Bar */}
      {searchVisible && (
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="搜索书名或作者"
            placeholderTextColor="#73726c"
            autoFocus
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      {/* Collection Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, !activeCollection && styles.tabActive]}
          onPress={() => setActiveCollection(null)}
        >
          <Text style={[styles.tabText, !activeCollection && styles.tabTextActive]}>全部</Text>
        </Pressable>
        {collections.map((col) => (
          <Pressable
            key={col.id}
            style={[styles.tab, activeCollection === col.id && styles.tabActive]}
            onPress={() => setActiveCollection(activeCollection === col.id ? null : col.id)}
          >
            <Text style={[styles.tabText, activeCollection === col.id && styles.tabTextActive]}>
              {col.name}
            </Text>
          </Pressable>
        ))}
        <Pressable style={styles.tabAdd} onPress={() => setCollectionModalVisible(true)}>
          <Text style={styles.tabAddText}>+</Text>
        </Pressable>
      </ScrollView>

      {/* Book Grid */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredBooks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {searchQuery ? '未找到匹配书籍' : '书架为空'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? '尝试其他关键词' : '点击右上角「导入」添加你的第一本书'}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onPress={() => openBook(book.id)}
                onLongPress={() => setActionSheetBookId(book.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Sheet */}
      <BookActionSheet
        visible={actionSheetBookId !== null}
        bookTitle={actionBook?.title || ''}
        bookId={actionSheetBookId || ''}
        collections={collections}
        onDelete={handleDeleteBook}
        onAddToCollection={handleAddToCollection}
        onNewCollection={() => {
          setActionSheetBookId(null);
          setCollectionModalVisible(true);
        }}
        onClose={() => setActionSheetBookId(null)}
      />

      {/* Collection Modal */}
      <CollectionModal
        visible={collectionModalVisible}
        onClose={() => setCollectionModalVisible(false)}
        onConfirm={(name) => {
          handleCreateCollection(name);
          setCollectionModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dedcd1',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Lora',
    fontWeight: '400',
    color: '#141413',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dedcd1',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#141413',
    fontFamily: 'Inter',
    paddingVertical: 6,
  },
  clearBtn: {
    fontSize: 16,
    color: '#73726c',
    padding: 4,
  },
  tabsContainer: {
    maxHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#dedcd1',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0ede6',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#141413',
  },
  tabText: {
    fontSize: 13,
    color: '#73726c',
    fontFamily: 'Inter',
  },
  tabTextActive: {
    color: '#faf9f5',
  },
  tabAdd: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dedcd1',
    marginRight: 8,
  },
  tabAddText: {
    fontSize: 16,
    color: '#73726c',
    fontFamily: 'Inter',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 120,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Lora',
    color: '#141413',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#73726c',
  },
});
