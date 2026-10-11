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
} from 'react-native';
import { PurinTheme } from '../theme/colors';
import { PurinButton } from '../components/PurinButton';
import { PurinInput } from '../components/PurinInput';

interface JoinRoomScreenProps {
  onEnterRoom: (roomData: {
    roomId: string;
    userName: string;
    isHost: boolean;
    initialVideoId?: string;
  }) => void;
}

export const JoinRoomScreen: React.FC<JoinRoomScreenProps> = ({ onEnterRoom }) => {
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : url.trim();
  };

  const handleJoin = () => {
    if (!userName.trim()) {
      Alert.alert('Falta tu nombre', 'Por favor ingresa un nombre o apodo.');
      return;
    }
    if (!roomCode.trim()) {
      Alert.alert('Falta el codigo', 'Ingresa el codigo de la sala a la que deseas unirte.');
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
      Alert.alert('Falta tu nombre', 'Por favor ingresa un nombre o apodo.');
      return;
    }

    const generatedCode = 'PURIN-' + Math.floor(100 + Math.random() * 900);
    const parsedVideoId = videoUrl.trim()
      ? extractYoutubeId(videoUrl)
      : 'jfKfPfyJRdk'; // Lo-Fi hip hop radio por defecto

    onEnterRoom({
      roomId: generatedCode,
      userName: userName.trim(),
      isHost: true,
      initialVideoId: parsedVideoId,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Encabezado con Logo Transparente del Personaje */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/purin_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>YoutubePurin</Text>
          <Text style={styles.subtitle}>Mira videos al mismo tiempo con tu gente</Text>
        </View>

        {/* Tarjeta de Formulario */}
        <View style={[styles.card, PurinTheme.shadows.cute]}>
          <PurinInput
            label="Tu Nombre o Apodo:"
            placeholder="Ej. Pudincito"
            value={userName}
            onChangeText={setUserName}
            maxLength={18}
          />

          {!isCreating ? (
            <>
              <PurinInput
                label="Codigo de la Sala:"
                placeholder="Ej. PURIN-402"
                value={roomCode}
                onChangeText={setRoomCode}
                autoCapitalize="characters"
              />

              <PurinButton
                title="Unirse a la Sala"
                onPress={handleJoin}
                style={styles.actionBtn}
              />

              <View style={styles.divider}>
                <Text style={styles.dividerText}>o tambien puedes</Text>
                <PurinButton
                  title="Crear una Sala Nueva"
                  variant="secondary"
                  onPress={() => setIsCreating(true)}
                  style={styles.secondaryBtn}
                />
              </View>
            </>
          ) : (
            <>
              <PurinInput
                label="Enlace o ID de YouTube inicial (opcional):"
                placeholder="https://youtu.be/..."
                value={videoUrl}
                onChangeText={setVideoUrl}
                autoCapitalize="none"
              />

              <PurinButton
                title="Crear Sala y Entrar"
                onPress={handleCreate}
                style={styles.actionBtn}
              />

              <PurinButton
                title="Volver a Unirse con Codigo"
                variant="secondary"
                onPress={() => setIsCreating(false)}
                style={styles.secondaryBtn}
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PurinTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 8,
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
