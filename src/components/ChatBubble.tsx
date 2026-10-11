import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PurinTheme, BubbleThemesConfig } from '../theme/colors';
import { ChatMessage, BubbleCustomization } from '../types';

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

  const bubbleBg = isSelf
    ? (themeConfig ? themeConfig.backgroundColor : PurinTheme.colors.bubbleSelf)
    : PurinTheme.colors.bubbleOther;

  const textColor = isSelf && themeConfig ? themeConfig.textColor : PurinTheme.colors.text;
  const borderColor = isSelf && themeConfig ? themeConfig.borderColor : PurinTheme.colors.stroke;
  const customRadius = activeCustomization?.borderRadius || PurinTheme.borders.radiusBubble;
  const expression = activeCustomization?.avatarExpression || ':3';

  return (
    <View style={[styles.row, isSelf ? styles.rowSelf : styles.rowOther]}>
      {!isSelf && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{expression}</Text>
        </View>
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
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
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
  bubble: {
    maxWidth: '78%',
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
