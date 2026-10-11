import React, { useState } from 'react';
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

    let parsedVideoId = 'jfKfPfyJRdk'; // Lo-Fi hip hop radio por defecto
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 25}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Selector de Idioma prominente y de mayor tamano */}
            <View style={styles.topLanguageRow}>
              <LanguageToggle
                size="large"
                currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange}
              />
            </View>

            {/* Encabezado con Logo Transparente del Personaje */}
            <View style={styles.header}>
              <Image
                source={require('../../assets/images/purin_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>{t.appTitle}</Text>
              <Text style={styles.subtitle}>{t.appSubtitle}</Text>
            </View>

            {/* Tarjeta de Formulario */}
            <View style={[styles.card, PurinTheme.shadows.cute]}>
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
    paddingBottom: 32,
  },
  topLanguageRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: PurinTheme.colors.text,
    letterSpacing: 0.5,
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
  actionBtn: {
    marginTop: 14,
  },
  secondaryBtn: {
    marginTop: 8,
  },
  divider: {
    alignItems: 'center',
    marginTop: 14,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: PurinTheme.colors.textMuted,
    marginBottom: 4,
  },
});
