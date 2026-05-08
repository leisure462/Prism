import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, TextInput } from 'react-native';

interface CollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export default function CollectionModal({ visible, onClose, onConfirm }: CollectionModalProps) {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onConfirm(trimmed);
      setName('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.card}>
          <Text style={styles.title}>新建分组</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="分组名称"
            placeholderTextColor="#73726c"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleConfirm}
          />
          <View style={styles.buttons}>
            <Pressable style={styles.btn} onPress={onClose}>
              <Text style={styles.btnText}>取消</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleConfirm}>
              <Text style={[styles.btnText, styles.btnTextPrimary]}>确定</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#faf9f5',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#141413',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dedcd1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#141413',
    fontFamily: 'Inter',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnPrimary: {
    backgroundColor: '#d97757',
  },
  btnText: {
    fontSize: 16,
    color: '#73726c',
    fontFamily: 'Inter',
  },
  btnTextPrimary: {
    color: '#fff',
  },
});
