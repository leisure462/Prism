import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookshelfStore } from '../store/bookshelfStore';
import BookCard from '../components/BookCard';
import IconButton from '../components/IconButton';
import { parseChapters } from '../parsers/TxtParser';

export default function BookshelfScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { books, addBook, setCurrentBook, setChapters } = useBookshelfStore();

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

      let content = '';
      if (ext === 'txt') {
        content = await RNFS.readFile(destPath, 'utf8');
      }

      const chapters = ext === 'txt' ? parseChapters(content) : [{ index: 0, title: '全文', startOffset: 0, endOffset: 0 }];
      const bookId = Date.now().toString();

      addBook({
        id: bookId,
        title: fileName.replace(/\.[^.]+$/, ''),
        author: '',
        filePath: destPath,
        format: ext as 'txt' | 'epub',
        lastReadPosition: 0,
        totalChapters: chapters.length,
        currentChapter: 0,
        addedAt: Date.now(),
      });

      setChapters(chapters);
      setCurrentBook(bookId);
      navigation.navigate('Reader', { bookId });
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) return;
      Alert.alert('导入失败', err.message);
    }
  }, [addBook, setChapters, setCurrentBook, navigation]);

  const openBook = useCallback((bookId: string) => {
    setCurrentBook(bookId);
    navigation.navigate('Reader', { bookId });
  }, [setCurrentBook, navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Prism</Text>
        <View style={styles.headerActions}>
          <IconButton label="设置" onPress={() => navigation.navigate('Settings')} color="#3d3d3a" />
          <IconButton label="导入" onPress={importBook} color="#d97757" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {books.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>书架为空</Text>
            <Text style={styles.emptySubtitle}>点击右上角「导入」添加你的第一本书</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} onPress={() => openBook(book.id)} />
            ))}
          </View>
        )}
      </ScrollView>
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
    gap: 8,
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
