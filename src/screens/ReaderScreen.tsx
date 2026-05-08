import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RNFS from 'react-native-fs';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useBookshelfStore } from '../store/bookshelfStore';
import { useSettingsStore } from '../store/settingsStore';
import { themes } from '../utils/theme';
import { getChapterContent } from '../parsers/TxtParser';
import IconButton from '../components/IconButton';
import EpubReader from '../components/EpubReader';
import TocDrawer from '../components/TocDrawer';

const { width: SCREEN_W } = Dimensions.get('window');

export default function ReaderScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { bookId } = route.params as { bookId: string };

  const { books, bookChapters, updateBookProgress } = useBookshelfStore();
  const settings = useSettingsStore();
  const theme = themes[settings.theme] || themes.vellum;

  const book = books.find((b) => b.id === bookId);
  const chapters = bookChapters[bookId] || [];
  const [content, setContent] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [tocVisible, setTocVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const epubReaderRef = useRef<any>(null);

  useEffect(() => {
    if (!book) return;
    const load = async () => {
      if (book.format === 'txt') {
        const text = await RNFS.readFile(book.filePath, 'utf8');
        const currentChapter = chapters[book.currentChapter] || chapters[0];
        if (currentChapter) {
          setContent(getChapterContent(text, currentChapter));
        }
      }
    };
    load();
  }, [book, chapters]);

  useEffect(() => {
    StatusBar.setBarStyle(theme.statusBar === 'dark' ? 'dark-content' : 'light-content');
    StatusBar.setBackgroundColor(theme.background);
  }, [theme]);

  const toggleMenu = useCallback(() => {
    const next = !menuVisible;
    setMenuVisible(next);
    setSettingsVisible(false);
    Animated.timing(fadeAnim, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [menuVisible, fadeAnim]);

  const handleNextChapter = useCallback(() => {
    if (!book) return;
    const next = Math.min(book.currentChapter + 1, chapters.length - 1);
    updateBookProgress(book.id, 0, next);
  }, [book, chapters, updateBookProgress]);

  const handlePrevChapter = useCallback(() => {
    if (!book) return;
    const prev = Math.max(book.currentChapter - 1, 0);
    updateBookProgress(book.id, 0, prev);
  }, [book, updateBookProgress]);

  const handleTocSelect = useCallback(
    (index: number) => {
      if (!book) return;
      updateBookProgress(book.id, 0, index);
    },
    [book, updateBookProgress]
  );

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      const { x } = event;
      const centerLeft = SCREEN_W * 0.35;
      const centerRight = SCREEN_W * 0.65;
      if (x >= centerLeft && x <= centerRight) {
        runOnJS(toggleMenu)();
      } else if (x > centerRight) {
        runOnJS(handleNextChapter)();
      } else {
        runOnJS(handlePrevChapter)();
      }
    });

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>书籍未找到</Text>
      </View>
    );
  }

  const currentChapter = chapters[book.currentChapter];
  const isEpub = book.format === 'epub';

  return (
    <GestureDetector gesture={isEpub ? Gesture.Tap() : tapGesture}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Bar */}
        <Animated.View
          style={[
            styles.topBar,
            {
              paddingTop: insets.top + 8,
              opacity: fadeAnim,
              backgroundColor: theme.background,
            },
          ]}
          pointerEvents={menuVisible ? 'auto' : 'none'}
        >
          <IconButton label="← 返回" onPress={() => navigation.goBack()} color={theme.text} />
          <Text style={[styles.chapterTitle, { color: theme.text }]} numberOfLines={1}>
            {currentChapter?.title || book.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconButton label="目录" onPress={() => setTocVisible(true)} color={theme.text} />
            <View style={{ width: 20 }} />
          </View>
        </Animated.View>

        {/* Content */}
        {isEpub ? (
          <EpubReader
            bookId={bookId}
            filePath={book.filePath}
            epubCfi={book.epubCfi}
            theme={settings.theme}
            fontSize={settings.fontSize}
            onLocationChange={(cfi, percentage) => {
              updateBookProgress(book.id, Math.round(percentage * 100), book.currentChapter, cfi);
            }}
            onToggleMenu={toggleMenu}
          />
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.contentContainer,
              {
                paddingHorizontal: settings.marginHorizontal,
                paddingVertical: settings.marginVertical,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={[
                styles.bodyText,
                {
                  color: theme.text,
                  fontSize: settings.fontSize,
                  lineHeight: settings.fontSize * settings.lineHeight,
                  fontFamily: settings.fontFamily === 'System' ? undefined : settings.fontFamily,
                  marginBottom: settings.paragraphSpacing,
                },
              ]}
            >
              {content}
            </Text>
          </ScrollView>
        )}

        {/* Bottom Bar */}
        <Animated.View
          style={[
            styles.bottomBar,
            {
              paddingBottom: insets.bottom + 8,
              opacity: fadeAnim,
              backgroundColor: theme.background,
            },
          ]}
          pointerEvents={menuVisible ? 'auto' : 'none'}
        >
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: theme.secondaryText }]}>
              {book.currentChapter + 1} / {chapters.length} 章
            </Text>
            <Pressable onPress={() => setSettingsVisible(!settingsVisible)}>
              <Text style={[styles.settingsLabel, { color: theme.accent }]}>阅读设置</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Reader Settings Panel */}
        {settingsVisible && menuVisible && (
          <View style={[styles.settingsPanel, { backgroundColor: theme.surface }]}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>字号</Text>
              <View style={styles.settingControls}>
                <Pressable onPress={() => settings.setFontSize(Math.max(12, settings.fontSize - 1))}>
                  <Text style={[styles.controlBtn, { color: theme.accent }]}>A-</Text>
                </Pressable>
                <Text style={[styles.settingValue, { color: theme.text }]}>{settings.fontSize}</Text>
                <Pressable onPress={() => settings.setFontSize(Math.min(32, settings.fontSize + 1))}>
                  <Text style={[styles.controlBtn, { color: theme.accent }]}>A+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>行距</Text>
              <View style={styles.settingControls}>
                <Pressable onPress={() => settings.setLineHeight(Math.max(1.2, settings.lineHeight - 0.1))}>
                  <Text style={[styles.controlBtn, { color: theme.accent }]}>-</Text>
                </Pressable>
                <Text style={[styles.settingValue, { color: theme.text }]}>{settings.lineHeight.toFixed(1)}</Text>
                <Pressable onPress={() => settings.setLineHeight(Math.min(2.5, settings.lineHeight + 0.1))}>
                  <Text style={[styles.controlBtn, { color: theme.accent }]}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>边距</Text>
              <View style={styles.settingControls}>
                <Pressable onPress={() => settings.setMarginHorizontal(Math.max(8, settings.marginHorizontal - 4))}>
                  <Text style={[styles.controlBtn, { color: theme.accent }]}>-</Text>
                </Pressable>
                <Text style={[styles.settingValue, { color: theme.text }]}>{settings.marginHorizontal}</Text>
                <Pressable onPress={() => settings.setMarginHorizontal(Math.min(48, settings.marginHorizontal + 4))}>
                  <Text style={[styles.controlBtn, { color: theme.accent }]}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>主题</Text>
              <View style={styles.themeRow}>
                {Object.entries(themes).map(([key, t]) => (
                  <Pressable
                    key={key}
                    onPress={() => settings.setTheme(key)}
                    style={[
                      styles.themeDot,
                      { backgroundColor: t.background, borderColor: settings.theme === key ? t.accent : t.divider },
                    ]}
                  >
                    <Text style={[styles.themeDotText, { color: t.text }]}>{t.name[0]}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* TOC Drawer */}
        <TocDrawer
          visible={tocVisible}
          chapters={chapters}
          currentChapter={book.currentChapter}
          onSelect={handleTocSelect}
          onClose={() => setTocVisible(false)}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  chapterTitle: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  bodyText: {
    fontWeight: '400',
    textAlign: 'justify',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter',
  },
  settingsLabel: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  settingsPanel: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 20,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  settingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlBtn: {
    fontSize: 18,
    fontWeight: '500',
    width: 32,
    textAlign: 'center',
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Inter',
    minWidth: 32,
    textAlign: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeDotText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
