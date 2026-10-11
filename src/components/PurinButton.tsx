import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { PurinTheme } from '../theme/colors';

interface PurinButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const PurinButton: React.FC<PurinButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#E0E0E0';
    switch (variant) {
      case 'secondary':
        return PurinTheme.colors.backgroundLight;
      case 'accent':
        return PurinTheme.colors.caramel;
      default:
        return PurinTheme.colors.primary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        PurinTheme.shadows.cuteSm,
        style,
      ]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: PurinTheme.borders.medium,
    borderColor: PurinTheme.colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: PurinTheme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
