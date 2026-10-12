import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PurinTheme, BubbleThemesConfig } from '../theme/colors';
import { ChatMessage, BubbleCustomization } from '../types';
import { BubbleDecoration } from './BubbleDecoration';

interface ChatBubbleProps {
  message: ChatMessage;
  isSelf: boolean;
  selfCustomization?: BubbleCustomization;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isSelf,
  selfCustomization,
}) => {
  if (message.isSystem) {
    return (
      <View style={styles.systemContainer}>
        <View style={styles.systemBubble}>
          <Text style={styles.systemText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  // Personalizacion activa
  const activeCustomization =
    message.customization || (isSelf ? selfCustomization : undefined);

  const themeConfig = activeCustomization
    ? BubbleThemesConfig[activeCustomization.themeId]
    : undefined;

  const bubbleBg = themeConfig
    ? themeConfig.backgroundColor
    : isSelf
    ? PurinTheme.colors.bubbleSelf
    : PurinTheme.colors.bubbleOther;

  const textColor = themeConfig ? themeConfig.textColor : PurinTheme.colors.text;
  const borderColor = themeConfig
    ? themeConfig.borderColor
    : isSelf
    ? PurinTheme.colors.stroke
    : PurinTheme.colors.strokeLight;
  const customRadius = activeCustomization?.borderRadius || PurinTheme.borders.radiusBubble;
  const decoration = activeCustomization?.decoration || 'none';

  return (
    <View
      style={[
        styles.row,
        isSelf ? styles.rowSelf : styles.rowOther,
        decoration !== 'none' && styles.rowWithDecoration,
      ]}
    >
      {!isSelf && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>:3</Text>
        </View>
      )}

      <View style={styles.bubbleWrapper}>
        {/* Decoracion de borde (Perrito asomado, Boina, Patitas, Huesito, Flan) */}
        {decoration !== 'none' && (
          <BubbleDecoration
            type={decoration}
            position={isSelf ? 'left' : 'left'}
          />
        )}

        <View
          style={[
            styles.bubble,
            {
              backgroundColor: bubbleBg,
              borderColor: borderColor,
              borderRadius: customRadius,
            },
            isSelf ? styles.bubbleSelf : styles.bubbleOther,
          ]}
        >
          {!isSelf && <Text style={styles.author}>{message.userName}</Text>}
          <Text style={[styles.messageText, { color: textColor }]}>
            {message.text}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  rowWithDecoration: {
    marginTop: 12, // Espacio para que el elemento asomado no choque con el mensaje superior
  },
  rowSelf: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PurinTheme.colors.primary,
    borderWidth: PurinTheme.borders.thin,
    borderColor: PurinTheme.colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 2,
  },
  avatarText: {
    fontSize: 9,
    fontWeight: '800',
    color: PurinTheme.colors.text,
  },
  bubbleWrapper: {
    position: 'relative',
    maxWidth: '78%',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: PurinTheme.borders.thin,
  },
  bubbleSelf: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  author: {
    fontSize: 10,
    fontWeight: '700',
    color: PurinTheme.colors.textMuted,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  systemContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  systemBubble: {
    backgroundColor: '#FFF3B0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: 1,
    borderColor: '#E6D59A',
  },
  systemText: {
    fontSize: 10,
    fontWeight: '600',
    color: PurinTheme.colors.textMuted,
  },
});
