import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet, ScrollView } from 'react-native';
import { Chapter } from '../types';

interface TocDrawerProps {
  visible: boolean;
  chapters: Chapter[];
  currentChapter: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export default function TocDrawer({ visible, chapters, currentChapter, onSelect, onClose }: TocDrawerProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.drawer}>
          <View style={styles.header}>
            <Text style={styles.title}>目录</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {chapters.map((ch) => (
              <Pressable
                key={ch.index}
                style={[styles.chapterRow, ch.index === currentChapter && styles.chapterRowActive]}
                onPress={() => {
                  onSelect(ch.index);
                  onClose();
                }}
              >
                <Text
                  style={[styles.chapterTitle, ch.index === currentChapter && styles.chapterTitleActive]}
                  numberOfLines={1}
                >
                  {ch.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '75%',
    backgroundColor: '#faf9f5',
    borderRightWidth: 1,
    borderRightColor: '#dedcd1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dedcd1',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#141413',
    fontFamily: 'Inter',
  },
  closeBtn: {
    fontSize: 18,
    color: '#73726c',
  },
  chapterRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  chapterRowActive: {
    backgroundColor: '#f0ede6',
  },
  chapterTitle: {
    fontSize: 15,
    color: '#141413',
    fontFamily: 'Inter',
  },
  chapterTitleActive: {
    color: '#d97757',
    fontWeight: '500',
  },
});
