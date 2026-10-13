import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { PurinTheme } from '../theme/colors';
import { PurinButton } from '../components/PurinButton';
import { PurinInput } from '../components/PurinInput';
import { LanguageToggle } from '../components/LanguageToggle';
import { translations, Language } from '../i18n/translations';
import { extractYoutubeId } from '../utils/youtube';

interface JoinRoomScreenProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onEnterRoom: (roomData: {
    roomId: string;
    userName: string;
    isHost: boolean;
    initialVideoId?: string;
  }) => void;
}

export const JoinRoomScreen: React.FC<JoinRoomScreenProps> = ({
  currentLanguage,
  onLanguageChange,
  onEnterRoom,
}) => {
  const t = translations[currentLanguage];
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardOpen(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardOpen(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleJoin = () => {
    if (!userName.trim()) {
      Alert.alert(t.missingNameTitle, t.missingNameMessage);
      return;
    }
    if (!roomCode.trim()) {
      Alert.alert(t.missingCodeTitle, t.missingCodeMessage);
      return;
    }

    onEnterRoom({
      roomId: roomCode.trim().toUpperCase(),
      userName: userName.trim(),
      isHost: false,
    });
  };

  const handleCreate = () => {
    if (!userName.trim()) {
      Alert.alert(t.missingNameTitle, t.missingNameMessage);
      return;
    }

    let parsedVideoId = '5qap5aO4i9A'; // Lofi Girl permanente y activo por defecto
    if (videoUrl.trim()) {
      const extracted = extractYoutubeId(videoUrl);
      if (!extracted) {
        Alert.alert(t.invalidLinkTitle, t.invalidLinkMessage);
        return;
      }
      parsedVideoId = extracted;
    }

    const generatedCode = 'PURIN-' + Math.floor(100 + Math.random() * 900);

    onEnterRoom({
      roomId: generatedCode,
      userName: userName.trim(),
      isHost: true,
      initialVideoId: parsedVideoId,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              isKeyboardOpen && styles.scrollContentKeyboard,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Selector de Idioma prominente */}
            <View style={[styles.topLanguageRow, isKeyboardOpen && styles.topLanguageRowKeyboard]}>
              <LanguageToggle
                size={isKeyboardOpen ? 'normal' : 'large'}
                currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange}
              />
            </View>

            {/* Encabezado con Logo del Personaje */}
            <View style={[styles.header, isKeyboardOpen && styles.headerKeyboard]}>
              <Image
                source={require('../../assets/images/purin_logo.png')}
                style={[styles.logo, isKeyboardOpen && styles.logoKeyboard]}
                resizeMode="contain"
              />
              <Text style={[styles.title, isKeyboardOpen && styles.titleKeyboard]}>
                {t.appTitle}
              </Text>
              {!isKeyboardOpen && (
                <Text style={styles.subtitle}>{t.appSubtitle}</Text>
              )}
            </View>

            {/* Tarjeta de Formulario */}
            <View style={[styles.card, PurinTheme.shadows.cute, isKeyboardOpen && styles.cardKeyboard]}>
              <PurinInput
                label={t.nicknameLabel}
                placeholder={t.nicknamePlaceholder}
                value={userName}
                onChangeText={setUserName}
                maxLength={18}
              />

              {!isCreating ? (
                <>
                  <PurinInput
                    label={t.roomCodeLabel}
                    placeholder={t.roomCodePlaceholder}
                    value={roomCode}
                    onChangeText={setRoomCode}
                    autoCapitalize="characters"
                  />

                  <PurinButton
                    title={t.joinButton}
                    onPress={handleJoin}
                    style={styles.actionBtn}
                  />

                  <View style={styles.divider}>
                    <Text style={styles.dividerText}>{t.createOptionText}</Text>
                    <PurinButton
                      title={t.createButtonOption}
                      variant="secondary"
                      onPress={() => setIsCreating(true)}
                      style={styles.secondaryBtn}
                    />
                  </View>
                </>
              ) : (
                <>
                  <PurinInput
                    label={t.initialVideoLabel}
                    placeholder={t.initialVideoPlaceholder}
                    value={videoUrl}
                    onChangeText={setVideoUrl}
                    autoCapitalize="none"
                  />

                  <PurinButton
                    title={t.createAndEnterButton}
                    onPress={handleCreate}
                    style={styles.actionBtn}
                  />

                  <PurinButton
                    title={t.backToJoinButton}
                    variant="secondary"
                    onPress={() => setIsCreating(false)}
                    style={styles.secondaryBtn}
                  />
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PurinTheme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 36 : 24,
    paddingBottom: 28,
  },
  scrollContentKeyboard: {
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'android' ? 12 : 16,
    paddingBottom: 10,
  },
  topLanguageRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  topLanguageRowKeyboard: {
    marginBottom: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerKeyboard: {
    marginBottom: 8,
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 6,
  },
  logoKeyboard: {
    width: 72,
    height: 72,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: PurinTheme.colors.text,
    letterSpacing: 0.5,
  },
  titleKeyboard: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: PurinTheme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: PurinTheme.colors.backgroundLight,
    borderRadius: PurinTheme.borders.radiusCard,
    borderWidth: PurinTheme.borders.thick,
    borderColor: PurinTheme.colors.stroke,
    padding: 22,
  },
  cardKeyboard: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  actionBtn: {
    marginTop: 12,
  },
  secondaryBtn: {
    marginTop: 8,
  },
  divider: {
    alignItems: 'center',
    marginTop: 12,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: PurinTheme.colors.textMuted,
    marginBottom: 4,
  },
});
