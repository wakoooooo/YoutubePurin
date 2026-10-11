import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PurinTheme, BubbleThemesConfig } from '../theme/colors';
import { BubbleCustomization, BubbleThemeId } from '../types';
import { translations, Language } from '../i18n/translations';

interface BubbleCustomizerModalProps {
  visible: boolean;
  onClose: () => void;
  customization: BubbleCustomization;
  onSave: (customization: BubbleCustomization) => void;
  language: Language;
}

const themeKeys: BubbleThemeId[] = ['flan', 'caramelo', 'fresa', 'matcha', 'lavanda'];
const expressions: BubbleCustomization['avatarExpression'][] = [
  ':3',
  '(^w^)',
  '(o.o)',
  '(u.u)',
];

export const BubbleCustomizerModal: React.FC<BubbleCustomizerModalProps> = ({
  visible,
  onClose,
  customization,
  onSave,
  language,
}) => {
  const [selectedTheme, setSelectedTheme] = React.useState<BubbleThemeId>(
    customization.themeId
  );
  const [selectedExpression, setSelectedExpression] = React.useState<
    BubbleCustomization['avatarExpression']
  >(customization.avatarExpression);

  React.useEffect(() => {
    setSelectedTheme(customization.themeId);
    setSelectedExpression(customization.avatarExpression);
  }, [customization, visible]);

  const handleApply = () => {
    onSave({
      themeId: selectedTheme,
      avatarExpression: selectedExpression,
      borderRadius: customization.borderRadius || 20,
    });
    onClose();
  };

  const previewConfig = BubbleThemesConfig[selectedTheme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, PurinTheme.shadows.cute]}>
          <Text style={styles.title}>
            {language === 'es' ? 'Personalizar Burbuja' : 'Customize Bubble'}
          </Text>

          {/* Vista previa en tiempo real */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>
              {language === 'es' ? 'Vista Previa:' : 'Preview:'}
            </Text>
            <View
              style={[
                styles.previewBubble,
                {
                  backgroundColor: previewConfig.backgroundColor,
                  borderColor: previewConfig.borderColor,
                },
              ]}
            >
              <Text style={[styles.previewText, { color: previewConfig.textColor }]}>
                {language === 'es'
                  ? `Asi se vera tu mensajito ${selectedExpression}`
                  : `Your message will look like this ${selectedExpression}`}
              </Text>
            </View>
          </View>

          {/* Selector de Color de Tema */}
          <Text style={styles.sectionTitle}>
            {language === 'es' ? 'Color de Postre:' : 'Dessert Color:'}
          </Text>
          <View style={styles.themesRow}>
            {themeKeys.map((key) => {
              const cfg = BubbleThemesConfig[key];
              const isSelected = selectedTheme === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedTheme(key)}
                  style={[
                    styles.themeCircle,
                    { backgroundColor: cfg.backgroundColor, borderColor: cfg.borderColor },
                    isSelected && styles.themeCircleSelected,
                  ]}
                >
                  <Text style={[styles.themeCircleText, { color: cfg.textColor }]}>
                    {language === 'es' ? cfg.name : cfg.nameEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selector de Expresion Avatar */}
          <Text style={styles.sectionTitle}>
            {language === 'es' ? 'Expresion de Avatar:' : 'Avatar Expression:'}
          </Text>
          <View style={styles.expressionsRow}>
            {expressions.map((exp) => {
              const isSelected = selectedExpression === exp;
              return (
                <TouchableOpacity
                  key={exp}
                  onPress={() => setSelectedExpression(exp)}
                  style={[
                    styles.expressionBtn,
                    isSelected && styles.expressionBtnSelected,
                  ]}
                >
                  <Text style={styles.expressionText}>{exp}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Botones de Accion */}
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleApply} style={styles.applyBtn}>
              <Text style={styles.applyText}>
                {language === 'es' ? 'Guardar Estilo' : 'Save Style'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: PurinTheme.colors.backgroundLight,
    borderRadius: PurinTheme.borders.radiusCard,
    borderWidth: PurinTheme.borders.thick,
    borderColor: PurinTheme.colors.stroke,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: PurinTheme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  previewContainer: {
    backgroundColor: '#FFF9D2',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: PurinTheme.colors.stroke,
    marginBottom: 14,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PurinTheme.colors.textMuted,
    marginBottom: 6,
  },
  previewBubble: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomRightRadius: 4,
  },
  previewText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: PurinTheme.colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  themeCircle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: 2,
  },
  themeCircleSelected: {
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
  },
  themeCircleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  expressionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  expressionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF9D2',
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: 1.5,
    borderColor: PurinTheme.colors.stroke,
  },
  expressionBtnSelected: {
    backgroundColor: PurinTheme.colors.primary,
    borderWidth: 2.5,
  },
  expressionText: {
    fontSize: 13,
    fontWeight: '800',
    color: PurinTheme.colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: PurinTheme.borders.radiusPill,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: PurinTheme.colors.textMuted,
  },
  applyBtn: {
    backgroundColor: PurinTheme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: PurinTheme.borders.medium,
    borderColor: PurinTheme.colors.stroke,
  },
  applyText: {
    fontSize: 12,
    fontWeight: '800',
    color: PurinTheme.colors.text,
  },
});
