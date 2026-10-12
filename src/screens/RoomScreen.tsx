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
import { PurinTheme } from '../theme/colors';
import { PurinInput } from '../components/PurinInput';
import { PurinButton } from '../components/PurinButton';
import { ChatBubble } from '../components/ChatBubble';
import {
  YoutubePlayerContainer,
  YoutubePlayerRef,
} from '../components/YoutubePlayerContainer';
import { LanguageToggle } from '../components/LanguageToggle';
import { BubbleCustomizerModal } from '../components/BubbleCustomizerModal';
import { translations, Language } from '../i18n/translations';
import { extractYoutubeId } from '../utils/youtube';
import { ChatMessage, BubbleCustomization } from '../types';
import { RoomSyncService } from '../services/roomSync';
import { isSupabaseConfigured } from '../services/supabase';

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
  initialVideoId = '5qap5aO4i9A',
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
  const [onlineCount, setOnlineCount] = useState(1);

  // Identificador unico del usuario para esta sesion
  const myUserId = useRef('user_' + Math.random().toString(36).substring(2, 9)).current;

  // Estado de personalizacion de burbuja del usuario
  const [bubbleCustomization, setBubbleCustomization] = useState<BubbleCustomization>({
    themeId: 'flan',
    decoration: 'purin_peek',
    borderRadius: 20,
  });

  // Chat inicial: notificacion de bienvenida a la sala
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
  const playerRef = useRef<YoutubePlayerRef>(null);
  const syncService = useRef<RoomSyncService>(new RoomSyncService());
  const isSyncingFromRemote = useRef(false);

  // Conexion al canal en tiempo real de Supabase
  useEffect(() => {
    syncService.current.connect(roomId, myUserId, userName, isHost, {
      onPresenceUpdate: (count) => {
        setOnlineCount(count);
      },
      onVideoSync: (payload) => {
        isSyncingFromRemote.current = true;
        if (payload.action === 'play') {
          setIsPlaying(true);
          playerRef.current?.playVideo();
          setMessages((prev) => [
            ...prev,
            {
              id: 'sys-' + Date.now(),
              userId: 'system',
              userName: 'Sistema',
              text: t.resumedVideoSystem.replace('{name}', payload.senderName),
              timestamp: Date.now(),
              isSystem: true,
            },
          ]);
        } else if (payload.action === 'pause') {
          setIsPlaying(false);
          playerRef.current?.pauseVideo();
          setMessages((prev) => [
            ...prev,
            {
              id: 'sys-' + Date.now(),
              userId: 'system',
              userName: 'Sistema',
              text: t.pausedVideoSystem.replace('{name}', payload.senderName),
              timestamp: Date.now(),
              isSystem: true,
            },
          ]);
        } else if (payload.action === 'change_video') {
          setVideoId(payload.videoId);
          setIsPlaying(true);
          playerRef.current?.loadVideo(payload.videoId);
          playerRef.current?.playVideo();
          setMessages((prev) => [
            ...prev,
            {
              id: 'sys-' + Date.now(),
              userId: 'system',
              userName: 'Sistema',
              text: t.changedVideoSystem.replace('{name}', payload.senderName),
              timestamp: Date.now(),
              isSystem: true,
            },
          ]);
        }
        setTimeout(() => {
          isSyncingFromRemote.current = false;
        }, 1200);
      },
      onChatMessage: (incomingMsg) => {
        setMessages((prev) => [...prev, incomingMsg]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
    });

    return () => {
      syncService.current.disconnect();
    };
  }, [roomId, myUserId, userName, isHost, t]);

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
      id: 'msg-' + Date.now() + Math.random().toString(36).substring(2, 5),
      userId: myUserId,
      userName: userName,
      text: inputText.trim(),
      timestamp: Date.now(),
      customization: { ...bubbleCustomization },
    };

    setMessages((prev) => [...prev, newMessage]);
    syncService.current.sendChatMessage(newMessage);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Control bidireccional e imperativo directo de pausa y reproduccion
  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (nextState) {
      playerRef.current?.playVideo();
    } else {
      playerRef.current?.pauseVideo();
    }

    // Retransmitir accion al canal de la sala
    syncService.current.sendVideoAction(nextState ? 'play' : 'pause', videoId);

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
      if (!isSyncingFromRemote.current) {
        syncService.current.sendVideoAction('play', videoId);
      }
    } else if (state === 'paused') {
      setIsPlaying(false);
      if (!isSyncingFromRemote.current) {
        syncService.current.sendVideoAction('pause', videoId);
      }
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

    playerRef.current?.loadVideo(parsedId);
    playerRef.current?.playVideo();

    // Retransmitir nuevo video a todos en la sala
    syncService.current.sendVideoAction('change_video', parsedId);

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
                {t.connectedCount.replace('{count}', String(onlineCount))}
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

        {/* Banner informativo si falta configurar Supabase */}
        {!isSupabaseConfigured() && (
          <View style={styles.configBanner}>
            <Text style={styles.configBannerText}>
              {currentLanguage === 'es'
                ? 'Conexion local: Configura tus credenciales de Supabase en supabaseConfig.ts para conectar con amigos.'
                : 'Local mode: Add Supabase credentials in supabaseConfig.ts to connect with friends.'}
            </Text>
          </View>
        )}

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
                  isSelf={item.userId === myUserId}
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
  configBanner: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEEBA',
    marginBottom: 6,
  },
  configBannerText: {
    fontSize: 10,
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
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
