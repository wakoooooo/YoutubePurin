import { BubbleThemeId } from '../types';

export const PurinTheme = {
  colors: {
    background: '#FFF8B8', // Amarillo pastel principal
    backgroundLight: '#FFFDF5', // Crema suave para tarjetas e inputs
    surface: '#FFFFFF',
    primary: '#FFE066', // Amarillo dorado del personaje
    primaryDark: '#F5C938',
    stroke: '#583226', // Marron chocolate para bordes y boina
    strokeLight: '#8D6E63',
    caramel: '#E79E45', // Caramelo suave
    text: '#583226',
    textMuted: '#795548',
    textLight: '#A1887F',
    bubbleOther: '#FFF9D2',
    bubbleSelf: '#FFE066',
    accentPink: '#FFD1DC',
    statusOnline: '#4CAF50',
    statusSync: '#FFE066',
  },
  borders: {
    thick: 3,
    medium: 2,
    thin: 1.5,
    radiusPill: 9999,
    radiusCard: 28,
    radiusBubble: 20,
    radiusInput: 18,
  },
  shadows: {
    cute: {
      shadowColor: '#583226',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 0,
      elevation: 4,
    },
    cuteSm: {
      shadowColor: '#583226',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 0,
      elevation: 2,
    },
  },
};

export const BubbleThemesConfig: Record<
  BubbleThemeId,
  {
    name: string;
    nameEn: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  flan: {
    name: 'Flan',
    nameEn: 'Flan',
    backgroundColor: '#FFE066',
    textColor: '#583226',
    borderColor: '#583226',
  },
  caramelo: {
    name: 'Caramelo',
    nameEn: 'Caramel',
    backgroundColor: '#F7C873',
    textColor: '#4E342E',
    borderColor: '#5D4037',
  },
  fresa: {
    name: 'Fresa',
    nameEn: 'Strawberry',
    backgroundColor: '#FFD1DC',
    textColor: '#583226',
    borderColor: '#583226',
  },
  matcha: {
    name: 'Matcha',
    nameEn: 'Matcha',
    backgroundColor: '#C8E6C9',
    textColor: '#2E473B',
    borderColor: '#3E5C49',
  },
  lavanda: {
    name: 'Lavanda',
    nameEn: 'Lavender',
    backgroundColor: '#E1BEE7',
    textColor: '#4A148C',
    borderColor: '#6A1B9A',
  },
};
