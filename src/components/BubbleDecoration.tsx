import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { PurinTheme } from '../theme/colors';
import { BubbleDecorationType } from '../types';

interface BubbleDecorationProps {
  type: BubbleDecorationType;
  position?: 'left' | 'right';
}

export const BubbleDecoration: React.FC<BubbleDecorationProps> = ({
  type,
  position = 'left',
}) => {
  if (type === 'none') return null;

  const posStyle = position === 'left' ? styles.anchorLeft : styles.anchorRight;

  switch (type) {
    case 'purin_peek':
      return (
        <View style={[styles.container, posStyle, styles.peekWrapper]}>
          <Image
            source={require('../../assets/images/purin_logo.png')}
            style={styles.peekImage}
            resizeMode="contain"
          />
        </View>
      );

    case 'beret':
      return (
        <View style={[styles.container, posStyle, styles.beretWrapper]}>
          <View style={styles.beretStem} />
          <View style={styles.beretBody} />
        </View>
      );

    case 'paws':
      return (
        <View style={[styles.container, posStyle, styles.pawsWrapper]}>
          <View style={styles.paw} />
          <View style={styles.paw} />
        </View>
      );

    case 'bone':
      return (
        <View style={[styles.container, styles.anchorRight, styles.boneWrapper]}>
          <View style={styles.boneKnob} />
          <View style={styles.boneBar} />
          <View style={styles.boneKnob} />
        </View>
      );

    case 'pudding':
      return (
        <View style={[styles.container, posStyle, styles.puddingWrapper]}>
          <View style={styles.caramelTop} />
          <View style={styles.flanBody} />
        </View>
      );

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10,
  },
  anchorLeft: {
    left: 10,
    top: -13,
  },
  anchorRight: {
    right: 12,
    top: -10,
  },
  // Purin Peek
  peekWrapper: {
    width: 26,
    height: 26,
    top: -16,
    left: 8,
  },
  peekImage: {
    width: '100%',
    height: '100%',
  },
  // Boina
  beretWrapper: {
    top: -10,
    left: 12,
    alignItems: 'center',
  },
  beretStem: {
    width: 2.5,
    height: 4,
    backgroundColor: '#583226',
    borderRadius: 1,
    marginBottom: -1,
  },
  beretBody: {
    width: 20,
    height: 9,
    backgroundColor: '#583226',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  // Patitas
  pawsWrapper: {
    flexDirection: 'row',
    gap: 4,
    top: -8,
    left: 12,
  },
  paw: {
    width: 7,
    height: 10,
    backgroundColor: '#FFE066',
    borderWidth: 1.5,
    borderColor: '#583226',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  // Huesito
  boneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    top: -8,
    right: 10,
  },
  boneKnob: {
    width: 6,
    height: 8,
    backgroundColor: '#FFF9D2',
    borderWidth: 1,
    borderColor: '#583226',
    borderRadius: 3,
  },
  boneBar: {
    width: 9,
    height: 4,
    backgroundColor: '#FFF9D2',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#583226',
    marginHorizontal: -1,
  },
  // Flancito
  puddingWrapper: {
    top: -11,
    left: 10,
    alignItems: 'center',
  },
  caramelTop: {
    width: 14,
    height: 4,
    backgroundColor: '#583226',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    marginBottom: -1,
  },
  flanBody: {
    width: 17,
    height: 8,
    backgroundColor: '#FFE066',
    borderWidth: 1.2,
    borderColor: '#583226',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
});
