import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PurinTheme } from '../theme/colors';
import { Language } from '../i18n/translations';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onLanguageChange('es')}
        style={[
          styles.button,
          currentLanguage === 'es' && styles.buttonActive,
        ]}
      >
        <Text
          style={[
            styles.text,
            currentLanguage === 'es' && styles.textActive,
          ]}
        >
          ES
        </Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onLanguageChange('en')}
        style={[
          styles.button,
          currentLanguage === 'en' && styles.buttonActive,
        ]}
      >
        <Text
          style={[
            styles.text,
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
  button: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: PurinTheme.borders.radiusPill,
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
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: PurinTheme.colors.textMuted,
  },
  textActive: {
    color: PurinTheme.colors.text,
    fontWeight: '800',
  },
});
