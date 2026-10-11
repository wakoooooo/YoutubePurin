import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PurinTheme, BubbleThemesConfig } from '../theme/colors';
import { BubbleCustomization, BubbleThemeId, BubbleDecorationType } from '../types';
import { BubbleDecoration } from './BubbleDecoration';
import { Language } from '../i18n/translations';

interface BubbleCustomizerModalProps {
  visible: boolean;
  onClose: () => void;
  customization: BubbleCustomization;
  onSave: (customization: BubbleCustomization) => void;
  language: Language;
}

interface DecorationOption {
  id: BubbleDecorationType;
  titleEs: string;
  titleEn: string;
}

const DECORATION_OPTIONS: DecorationOption[] = [
  { id: 'purin_peek', titleEs: 'Perrito', titleEn: 'Puppy' },
  { id: 'beret', titleEs: 'Boina', titleEn: 'Beret' },
  { id: 'paws', titleEs: 'Patitas', titleEn: 'Paws' },
  { id: 'bone', titleEs: 'Huesito', titleEn: 'Bone' },
  { id: 'pudding', titleEs: 'Flancito', titleEn: 'Flan' },
  { id: 'none', titleEs: 'Clasico', titleEn: 'Classic' },
];

const THEME_KEYS: BubbleThemeId[] = ['flan', 'caramelo', 'fresa', 'matcha', 'lavanda'];

export const BubbleCustomizerModal: React.FC<BubbleCustomizerModalProps> = ({
  visible,
  onClose,
  customization,
  onSave,
  language,
}) => {
  const [selectedDecoration, setSelectedDecoration] = useState<BubbleDecorationType>(
    customization.decoration || 'purin_peek'
  );
  const [selectedTheme, setSelectedTheme] = useState<BubbleThemeId>(
    customization.themeId || 'flan'
  );

  useEffect(() => {
    setSelectedDecoration(customization.decoration || 'purin_peek');
    setSelectedTheme(customization.themeId || 'flan');
  }, [customization, visible]);

  const handleApply = () => {
    onSave({
      themeId: selectedTheme,
      decoration: selectedDecoration,
      borderRadius: customization.borderRadius || 20,
    });
    onClose();
  };

  const previewTheme = BubbleThemesConfig[selectedTheme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, PurinTheme.shadows.cute]}>
          <Text style={styles.headerTitle}>
            {language === 'es' ? 'Burbuja' : 'Bubble'}
          </Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Cuadricula de 2 Columnas de Estilos de Burbuja */}
            <View style={styles.grid}>
              {DECORATION_OPTIONS.map((item) => {
                const isSelected = selectedDecoration === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedDecoration(item.id)}
                    style={[
                      styles.cardItem,
                      isSelected && styles.cardItemSelected,
                    ]}
                  >
                    {/* Contenedor de Mini Burbuja con Decoracion Asomada */}
                    <View style={styles.miniBubbleContainer}>
                      <BubbleDecoration type={item.id} position="left" />
                      <View
                        style={[
                          styles.miniBubble,
                          {
                            backgroundColor: previewTheme.backgroundColor,
                            borderColor: previewTheme.borderColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.miniBubbleText,
                            { color: previewTheme.textColor },
                          ]}
                        >
                          {language === 'es' ? 'Hola!' : "What's up"}
                        </Text>
                      </View>
                    </View>

                    {/* Nombre del Estilo debajo de la burbuja */}
                    <Text
                      style={[
                        styles.cardTitle,
                        isSelected && styles.cardTitleSelected,
                      ]}
                    >
                      {language === 'es' ? item.titleEs : item.titleEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selector de Paleta de Color */}
            <Text style={styles.sectionSubtitle}>
              {language === 'es' ? 'Paleta de Color' : 'Color Palette'}
            </Text>
            <View style={styles.themesRow}>
              {THEME_KEYS.map((key) => {
                const cfg = BubbleThemesConfig[key];
                const isSelected = selectedTheme === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSelectedTheme(key)}
                    style={[
                      styles.themePill,
                      { backgroundColor: cfg.backgroundColor, borderColor: cfg.borderColor },
                      isSelected && styles.themePillSelected,
                    ]}
                  >
                    <Text style={[styles.themePillText, { color: cfg.textColor }]}>
                      {language === 'es' ? cfg.name : cfg.nameEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '85%',
    backgroundColor: '#1E1B18', // Fondo oscuro como en la referencia para resaltar las burbujas
    borderRadius: PurinTheme.borders.radiusCard,
    borderWidth: PurinTheme.borders.thick,
    borderColor: PurinTheme.colors.stroke,
    padding: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF8B8',
    marginBottom: 12,
    textAlign: 'left',
    paddingHorizontal: 4,
  },
  scrollArea: {
    maxHeight: 420,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 4,
  },
  cardItem: {
    width: '48%',
    backgroundColor: '#2B2621',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#4A3B32',
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardItemSelected: {
    borderColor: '#FFE066',
    borderWidth: 2.5,
    backgroundColor: '#383028',
  },
  miniBubbleContainer: {
    position: 'relative',
    marginBottom: 12,
    marginTop: 8,
  },
  miniBubble: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomRightRadius: 4,
  },
  miniBubbleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D7CCC8',
  },
  cardTitleSelected: {
    color: '#FFE066',
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF8B8',
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 2,
    marginBottom: 12,
  },
  themePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: 1.5,
  },
  themePillSelected: {
    borderWidth: 2.5,
    transform: [{ scale: 1.05 }],
  },
  themePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#3E3228',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: PurinTheme.borders.radiusPill,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D7CCC8',
  },
  applyBtn: {
    backgroundColor: PurinTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: PurinTheme.borders.medium,
    borderColor: PurinTheme.colors.stroke,
  },
  applyText: {
    fontSize: 13,
    fontWeight: '800',
    color: PurinTheme.colors.text,
  },
});
