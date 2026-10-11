import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { PurinTheme } from '../theme/colors';

interface PurinInputProps extends TextInputProps {
  label?: string;
}

export const PurinInput: React.FC<PurinInputProps> = ({ label, style, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={PurinTheme.colors.textLight}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: PurinTheme.colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFF9D2',
    borderWidth: PurinTheme.borders.medium,
    borderColor: PurinTheme.colors.stroke,
    borderRadius: PurinTheme.borders.radiusInput,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: PurinTheme.colors.text,
  },
});
