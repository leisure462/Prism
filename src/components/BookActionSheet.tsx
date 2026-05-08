import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';

interface BookActionSheetProps {
  visible: boolean;
  bookTitle: string;
  collections: { id: string; name: string; bookIds: string[] }[];
  bookId: string;
  onDelete: () => void;
  onAddToCollection: (collectionId: string) => void;
  onNewCollection: () => void;
  onClose: () => void;
}

export default function BookActionSheet({
  visible,
  bookTitle,
  collections,
  bookId,
  onDelete,
  onAddToCollection,
  onNewCollection,
  onClose,
}: BookActionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title} numberOfLines={1}>{bookTitle}</Text>
          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>添加到分组</Text>
          {collections.length === 0 ? (
            <Text style={styles.emptyHint}>暂无分组</Text>
          ) : (
            collections.map((c) => {
              const inCollection = c.bookIds.includes(bookId);
              return (
                <Pressable
                  key={c.id}
                  style={styles.actionRow}
                  onPress={() => onAddToCollection(c.id)}
                >
                  <Text style={[styles.actionText, inCollection && styles.actionTextDone]}>
                    {c.name} {inCollection ? '✓' : ''}
                  </Text>
                </Pressable>
              );
            })
          )}
          <Pressable style={styles.actionRow} onPress={onNewCollection}>
            <Text style={[styles.actionText, { color: '#d97757' }]}>+ 新建分组</Text>
          </Pressable>

          <View style={styles.divider} />
          <Pressable style={styles.actionRow} onPress={onDelete}>
            <Text style={[styles.actionText, { color: '#d9534f' }]}>删除书籍</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.actionRow} onPress={onClose}>
            <Text style={styles.actionText}>取消</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#faf9f5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 34,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#141413',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  sectionLabel: {
    fontSize: 12,
    color: '#73726c',
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  emptyHint: {
    fontSize: 14,
    color: '#73726c',
    fontFamily: 'Inter',
    paddingVertical: 8,
  },
  actionRow: {
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#141413',
    fontFamily: 'Inter',
  },
  actionTextDone: {
    color: '#73726c',
  },
  divider: {
    height: 1,
    backgroundColor: '#dedcd1',
    marginVertical: 4,
  },
});
