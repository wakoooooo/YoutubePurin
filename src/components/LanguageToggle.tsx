import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PurinTheme } from '../theme/colors';
import { Language } from '../i18n/translations';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  size?: 'normal' | 'large';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
  size = 'normal',
}) => {
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, isLarge && styles.containerLarge, isLarge && PurinTheme.shadows.cuteSm]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onLanguageChange('es')}
        style={[
          styles.button,
          isLarge && styles.buttonLarge,
          currentLanguage === 'es' && styles.buttonActive,
        ]}
      >
        <Text
          style={[
            styles.text,
            isLarge && styles.textLarge,
            currentLanguage === 'es' && styles.textActive,
          ]}
        >
          ES
        </Text>
      </TouchableOpacity>

      <View style={[styles.separator, isLarge && styles.separatorLarge]} />

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onLanguageChange('en')}
        style={[
          styles.button,
          isLarge && styles.buttonLarge,
          currentLanguage === 'en' && styles.buttonActive,
        ]}
      >
        <Text
          style={[
            styles.text,
            isLarge && styles.textLarge,
            currentLanguage === 'en' && styles.textActive,
          ]}
        >
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PurinTheme.colors.backgroundLight,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: PurinTheme.borders.thin,
    borderColor: PurinTheme.colors.stroke,
    padding: 2,
  },
  containerLarge: {
    padding: 4,
    borderWidth: PurinTheme.borders.medium,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: PurinTheme.borders.radiusPill,
  },
  buttonLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonActive: {
    backgroundColor: PurinTheme.colors.primary,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: PurinTheme.colors.strokeLight,
    opacity: 0.5,
  },
  separatorLarge: {
    height: 18,
    width: 1.5,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: PurinTheme.colors.textMuted,
  },
  textLarge: {
    fontSize: 14,
    fontWeight: '800',
  },
  textActive: {
    color: PurinTheme.colors.text,
    fontWeight: '800',
  },
});
