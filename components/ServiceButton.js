// components/ServiceButton.js
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function ServiceButton({ nombre, precio, seleccionado, onPress }) {
  return (
    <Pressable
      style={[
        styles.button,
        seleccionado && styles.selectedButton,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, seleccionado && styles.selectedText]}>{nombre}</Text>
      <Text style={[styles.price, seleccionado && styles.selectedText]}>
        S/ {precio.toFixed(2)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dfe9f5',
    borderRadius: 12,
    backgroundColor: '#f3f8ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#d9f1e4',
    borderColor: '#3aa66d',
  },
  text: {
    color: '#254a5a',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  price: {
    color: '#254a5a',
    fontSize: 14,
    fontWeight: '700',
  },
  selectedText: {
    color: '#1a5a3b',
  },
});
