import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { PurinTheme } from '../theme/colors';
import { PurinInput } from '../components/PurinInput';
import { PurinButton } from '../components/PurinButton';
import { ChatBubble } from '../components/ChatBubble';
import { YoutubePlayerContainer } from '../components/YoutubePlayerContainer';
import { LanguageToggle } from '../components/LanguageToggle';
import { BubbleCustomizerModal } from '../components/BubbleCustomizerModal';
import { translations, Language } from '../i18n/translations';
import { extractYoutubeId } from '../utils/youtube';
import { ChatMessage, BubbleCustomization } from '../types';

interface RoomScreenProps {
  roomId: string;
  userName: string;
  isHost: boolean;
  initialVideoId?: string;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onLeaveRoom: () => void;
}

export const RoomScreen: React.FC<RoomScreenProps> = ({
  roomId,
  userName,
  isHost,
  initialVideoId = 'jfKfPfyJRdk',
  currentLanguage,
  onLanguageChange,
  onLeaveRoom,
}) => {
  const t = translations[currentLanguage];
  const [videoId, setVideoId] = useState(initialVideoId);
  const [isPlaying, setIsPlaying] = useState(true);
  const [inputText, setInputText] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Estado de personalizacion de burbuja del usuario
  const [bubbleCustomization, setBubbleCustomization] = useState<BubbleCustomization>({
    themeId: 'flan',
    avatarExpression: ':3',
    borderRadius: 20,
  });

  // Chat inicial limpio: unicamente notificacion del sistema de bienvenida a la sala
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'sys-join',
      userId: 'system',
      userName: 'Sistema',
      text: t.joinedRoomSystem.replace('{roomId}', roomId),
      timestamp: Date.now(),
      isSystem: true,
    },
  ]);

  const flatListRef = useRef<FlatList>(null);
  const playerRef = useRef<YoutubeIframeRef>(null);

  // Auto-scroll del chat cuando se abre o cierra el teclado virtual
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 150);
      }
    );

    return () => {
      showSub.remove();
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      userId: 'self',
      userName: userName,
      text: inputText.trim(),
      timestamp: Date.now(),
      customization: { ...bubbleCustomization },
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Control bidireccional e imperativo directo de pausa y reproduccion
  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    // Ejecucion imperativa directa en el reproductor de YouTube
    if (nextState) {
      playerRef.current?.playVideo?.();
    } else {
      playerRef.current?.pauseVideo?.();
    }

    const actionText = nextState
      ? t.resumedVideoSystem.replace('{name}', userName)
      : t.pausedVideoSystem.replace('{name}', userName);

    setMessages((prev) => [
      ...prev,
      {
        id: 'sys-' + Date.now(),
        userId: 'system',
        userName: 'Sistema',
        text: actionText,
        timestamp: Date.now(),
        isSystem: true,
      },
    ]);
  };

  const handlePlayerStateChange = (state: string) => {
    if (state === 'playing') {
      setIsPlaying(true);
    } else if (state === 'paused' || state === 'ended') {
      setIsPlaying(false);
    }
  };

  const handleChangeVideo = () => {
    if (!newVideoUrl.trim()) return;

    const parsedId = extractYoutubeId(newVideoUrl);
    if (!parsedId) {
      Alert.alert(t.invalidLinkTitle, t.invalidLinkMessage);
      return;
    }

    setVideoId(parsedId);
    setNewVideoUrl('');
    setShowVideoInput(false);
    setIsPlaying(true);

    setTimeout(() => {
      playerRef.current?.playVideo?.();
    }, 500);

    setMessages((prev) => [
      ...prev,
      {
        id: 'sys-' + Date.now(),
        userId: 'system',
        userName: 'Sistema',
        text: t.changedVideoSystem.replace('{name}', userName),
        timestamp: Date.now(),
        isSystem: true,
      },
    ]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Barra Superior con Informacion de Sala y Selector de Idioma */}
        <View style={styles.topBar}>
          <View style={styles.roomInfo}>
            <View style={styles.onlineDot} />
            <View>
              <Text style={styles.roomCodeText}>
                {t.roomPrefix} {roomId}
              </Text>
              <Text style={styles.onlineCountText}>
                {t.connectedCount.replace('{count}', '3')}
              </Text>
            </View>
          </View>

          <View style={styles.topActions}>
            <LanguageToggle
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
            />
            <TouchableOpacity onPress={onLeaveRoom} style={styles.leaveButton}>
              <Text style={styles.leaveButtonText}>{t.leaveButton}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seccion del Reproductor de Video */}
        <View style={styles.playerSection}>
          <YoutubePlayerContainer
            ref={playerRef}
            videoId={videoId}
            playing={isPlaying}
            onStateChange={handlePlayerStateChange}
            title="YouTube Player"
            isHost={isHost}
            statusBadgeText={isHost ? t.hostBadge : t.synchronizedBadge}
          />

          {/* Botones de Control de Sincronizacion */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={handleTogglePlay} style={styles.syncBtn}>
              <Text style={styles.syncBtnText}>
                {isPlaying ? t.pauseForAll : t.playForAll}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowVideoInput(!showVideoInput)}
              style={styles.changeVideoBtn}
            >
              <Text style={styles.changeVideoBtnText}>{t.changeVideo}</Text>
            </TouchableOpacity>
          </View>

          {showVideoInput && (
            <View style={styles.changeVideoContainer}>
              <PurinInput
                placeholder={t.newVideoPlaceholder}
                value={newVideoUrl}
                onChangeText={setNewVideoUrl}
                autoCapitalize="none"
              />
              <PurinButton title={t.loadButton} onPress={handleChangeVideo} />
            </View>
          )}
        </View>

        {/* Seccion de Chat Desplazable con Teclado */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 20}
          style={styles.chatAvoidingContainer}
        >
          <View style={[styles.chatSection, PurinTheme.shadows.cuteSm]}>
            {/* Cabecera del Chat con Boton de Personalizacion */}
            <View style={styles.chatHeaderRow}>
              <Text style={styles.chatHeaderTitle}>
                {currentLanguage === 'es' ? 'Chat en vivo' : 'Live Chat'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowCustomizer(true)}
                style={styles.customizeBubbleBtn}
              >
                <Text style={styles.customizeBubbleBtnText}>
                  {currentLanguage === 'es' ? 'Personalizar Burbuja' : 'Customize Bubble'}
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ChatBubble
                  message={item}
                  isSelf={item.userId === 'self'}
                  selfCustomization={bubbleCustomization}
                />
              )}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />

            {/* Barra de Entrada de Texto */}
            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <PurinInput
                  placeholder={t.chatPlaceholder}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSendMessage}
                  returnKeyType="send"
                />
              </View>
              <PurinButton
                title={t.sendButton}
                onPress={handleSendMessage}
                style={styles.sendBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Modal de Personalizacion de Burbujas */}
        <BubbleCustomizerModal
          visible={showCustomizer}
          onClose={() => setShowCustomizer(false)}
          customization={bubbleCustomization}
          onSave={setBubbleCustomization}
          language={currentLanguage}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PurinTheme.colors.background,
    paddingTop: Platform.OS === 'android' ? 36 : 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PurinTheme.colors.backgroundLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: PurinTheme.borders.radiusBubble,
    borderWidth: PurinTheme.borders.medium,
    borderColor: PurinTheme.colors.stroke,
    marginBottom: 8,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: PurinTheme.colors.statusOnline,
    marginRight: 8,
  },
  roomCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: PurinTheme.colors.text,
  },
  onlineCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: PurinTheme.colors.textMuted,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaveButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFE0B2',
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: PurinTheme.borders.thin,
    borderColor: PurinTheme.colors.stroke,
  },
  leaveButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: PurinTheme.colors.text,
  },
  playerSection: {
    marginBottom: 6,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  syncBtn: {
    flex: 1,
    backgroundColor: PurinTheme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: PurinTheme.borders.thin,
    borderColor: PurinTheme.colors.stroke,
    alignItems: 'center',
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: PurinTheme.colors.text,
  },
  changeVideoBtn: {
    backgroundColor: PurinTheme.colors.backgroundLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: PurinTheme.borders.thin,
    borderColor: PurinTheme.colors.stroke,
    alignItems: 'center',
  },
  changeVideoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: PurinTheme.colors.text,
  },
  changeVideoContainer: {
    backgroundColor: PurinTheme.colors.backgroundLight,
    padding: 10,
    borderRadius: 16,
    borderWidth: PurinTheme.borders.thin,
    borderColor: PurinTheme.colors.stroke,
    marginTop: 6,
  },
  chatAvoidingContainer: {
    flex: 1,
  },
  chatSection: {
    flex: 1,
    backgroundColor: PurinTheme.colors.backgroundLight,
    borderRadius: PurinTheme.borders.radiusCard,
    borderWidth: PurinTheme.borders.thick,
    borderColor: PurinTheme.colors.stroke,
    padding: 12,
    justifyContent: 'space-between',
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderColor: '#F0EAE1',
    marginBottom: 6,
  },
  chatHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: PurinTheme.colors.textMuted,
  },
  customizeBubbleBtn: {
    backgroundColor: '#FFF9D2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: 1,
    borderColor: PurinTheme.colors.stroke,
  },
  customizeBubbleBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: PurinTheme.colors.text,
  },
  messagesList: {
    flexGrow: 1,
    paddingBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  inputWrapper: {
    flex: 1,
  },
  sendBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
});
