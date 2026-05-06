import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';

interface IconButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  color?: string;
}

export default function IconButton({ label, onPress, style, color = '#141413' }: IconButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.button, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9.6,
  },
  text: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
});
