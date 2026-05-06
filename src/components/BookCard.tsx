import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onPress: () => void;
}

export default function BookCard({ book, onPress }: BookCardProps) {
  const formatLabel = { txt: 'TXT', epub: 'EPUB', pdf: 'PDF' }[book.format];

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cover}>
        <Text style={styles.coverTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <View style={styles.formatBadge}>
          <Text style={styles.formatText}>{formatLabel}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {book.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {book.author || '未知作者'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '30%',
    marginBottom: 24,
  },
  cover: {
    aspectRatio: 3 / 4,
    backgroundColor: '#f0ede6',
    borderRadius: 9.6,
    borderWidth: 1,
    borderColor: '#dedcd1',
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coverTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#141413',
    fontFamily: 'Lora',
    lineHeight: 20,
  },
  formatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#faf9f5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#dedcd1',
  },
  formatText: {
    fontSize: 10,
    color: '#73726c',
    fontFamily: 'Inter',
  },
  title: {
    fontSize: 14,
    color: '#141413',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  author: {
    fontSize: 12,
    color: '#73726c',
    fontFamily: 'Inter',
    marginTop: 2,
  },
});
