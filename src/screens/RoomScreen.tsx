import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { PurinTheme } from '../theme/colors';
import { PurinInput } from '../components/PurinInput';
import { PurinButton } from '../components/PurinButton';
import { ChatBubble } from '../components/ChatBubble';
import { YoutubePlayerContainer } from '../components/YoutubePlayerContainer';
import { ChatMessage, FloatingReaction } from '../types';

interface RoomScreenProps {
  roomId: string;
  userName: string;
  isHost: boolean;
  initialVideoId?: string;
  onLeaveRoom: () => void;
}

export const RoomScreen: React.FC<RoomScreenProps> = ({
  roomId,
  userName,
  isHost,
  initialVideoId = 'jfKfPfyJRdk',
  onLeaveRoom,
}) => {
  const [videoId, setVideoId] = useState(initialVideoId);
  const [isPlaying, setIsPlaying] = useState(true);
  const [inputText, setInputText] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'sys-1',
      userId: 'system',
      userName: 'Sistema',
      text: `Te has unido a la sala ${roomId}`,
      timestamp: Date.now(),
      isSystem: true,
    },
    {
      id: 'msg-1',
      userId: 'user-mimi',
      userName: 'Mimi',
      text: 'Hola, esta cancion esta perfecta para relajarse',
      timestamp: Date.now() - 60000,
    },
  ]);

  const flatListRef = useRef<FlatList>(null);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : url.trim();
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      userId: 'self',
      userName: userName,
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    const actionText = nextState
      ? `${userName} reanudo el video`
      : `${userName} pauso el video`;

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

  const handleChangeVideo = () => {
    if (!newVideoUrl.trim()) return;
    const extracted = extractYoutubeId(newVideoUrl);
    setVideoId(extracted);
    setNewVideoUrl('');
    setShowVideoInput(false);

    setMessages((prev) => [
      ...prev,
      {
        id: 'sys-' + Date.now(),
        userId: 'system',
        userName: 'Sistema',
        text: `${userName} cambio el video`,
        timestamp: Date.now(),
        isSystem: true,
      },
    ]);
  };

  const handleTriggerReaction = (type: FloatingReaction['type'], label: string) => {
    const newReaction: FloatingReaction = {
      id: 'rx-' + Date.now() + Math.random(),
      type,
      label,
      x: Math.random() * (Dimensions.get('window').width - 120) + 20,
    };

    setReactions((prev) => [...prev, newReaction]);

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Barra Superior de la Sala */}
      <View style={styles.topBar}>
        <View style={styles.roomInfo}>
          <View style={styles.onlineDot} />
          <View>
            <Text style={styles.roomCodeText}>Sala: {roomId}</Text>
            <Text style={styles.onlineCountText}>3 personas conectadas</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onLeaveRoom} style={styles.leaveButton}>
          <Text style={styles.leaveButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Contenedor del Reproductor de YouTube */}
      <View style={styles.playerSection}>
        <YoutubePlayerContainer
          videoId={videoId}
          playing={isPlaying}
          onStateChange={(state) => {
            if (state === 'ended') setIsPlaying(false);
          }}
          title="Lo-Fi Chill Beats live"
          isHost={isHost}
        />

        {/* Controles de Sincronizacion */}
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={handleTogglePlay} style={styles.syncBtn}>
            <Text style={styles.syncBtnText}>
              {isPlaying ? 'Pausar para todos' : 'Reproducir para todos'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowVideoInput(!showVideoInput)}
            style={styles.changeVideoBtn}
          >
            <Text style={styles.changeVideoBtnText}>Cambiar Video</Text>
          </TouchableOpacity>
        </View>

        {showVideoInput && (
          <View style={styles.changeVideoContainer}>
            <PurinInput
              placeholder="Pega nuevo link de YouTube..."
              value={newVideoUrl}
              onChangeText={setNewVideoUrl}
            />
            <PurinButton title="Cargar" onPress={handleChangeVideo} />
          </View>
        )}
      </View>

      {/* Seccion de Chat Tematizado */}
      <View style={[styles.chatSection, PurinTheme.shadows.cuteSm]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble message={item} isSelf={item.userId === 'self'} />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Reacciones Flotantes Animadas */}
        {reactions.map((r) => (
          <View
            key={r.id}
            style={[styles.floatingBadge, { left: r.x }]}
          >
            <Text style={styles.floatingBadgeText}>[{r.label}]</Text>
          </View>
        ))}

        {/* Barra de Reacciones Rapidas */}
        <View style={styles.reactionsBar}>
          <TouchableOpacity
            onPress={() => handleTriggerReaction('flan', 'Flan')}
            style={styles.reactionBtn}
          >
            <Text style={styles.reactionText}>Flan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTriggerReaction('patita', 'Patita')}
            style={styles.reactionBtn}
          >
            <Text style={styles.reactionText}>Patita</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTriggerReaction('amor', 'Amor')}
            style={[styles.reactionBtn, styles.heartBtn]}
          >
            <Text style={styles.reactionText}>Amor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTriggerReaction('huesito', 'Huesito')}
            style={styles.reactionBtn}
          >
            <Text style={styles.reactionText}>Huesito</Text>
          </TouchableOpacity>
        </View>

        {/* Barra de Entrada de Texto */}
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <PurinInput
              placeholder="Escribe un mensajito..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
            />
          </View>
          <PurinButton
            title="Enviar"
            onPress={handleSendMessage}
            style={styles.sendBtn}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PurinTheme.colors.background,
    paddingTop: Platform.OS === 'android' ? 36 : 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PurinTheme.colors.backgroundLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: PurinTheme.borders.radiusBubble,
    borderWidth: PurinTheme.borders.medium,
    borderColor: PurinTheme.colors.stroke,
    marginBottom: 10,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PurinTheme.colors.statusOnline,
    marginRight: 8,
  },
  roomCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: PurinTheme.colors.text,
  },
  onlineCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: PurinTheme.colors.textMuted,
  },
  leaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    marginBottom: 8,
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
  chatSection: {
    flex: 1,
    backgroundColor: PurinTheme.colors.backgroundLight,
    borderRadius: PurinTheme.borders.radiusCard,
    borderWidth: PurinTheme.borders.thick,
    borderColor: PurinTheme.colors.stroke,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  messagesList: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  floatingBadge: {
    position: 'absolute',
    bottom: 90,
    backgroundColor: PurinTheme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: PurinTheme.borders.thin,
    borderColor: PurinTheme.colors.stroke,
  },
  floatingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: PurinTheme.colors.text,
  },
  reactionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderColor: '#EFEBE9',
  },
  reactionBtn: {
    backgroundColor: '#FFF9D2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: PurinTheme.borders.thin,
    borderColor: PurinTheme.colors.stroke,
  },
  heartBtn: {
    backgroundColor: PurinTheme.colors.accentPink,
  },
  reactionText: {
    fontSize: 11,
    fontWeight: '700',
    color: PurinTheme.colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
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
