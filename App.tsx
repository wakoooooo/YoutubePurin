import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, LogBox } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { PurinTheme } from './src/theme/colors';
import { JoinRoomScreen } from './src/screens/JoinRoomScreen';
import { RoomScreen } from './src/screens/RoomScreen';
import { Language } from './src/i18n/translations';

// Ignorar advertencias internas de red y temporizadores del CLI de desarrollo
LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
  'Setting a timer',
  'Animated: `useNativeDriver`',
]);

interface ActiveRoomData {
  roomId: string;
  userName: string;
  isHost: boolean;
  initialVideoId?: string;
}

export default function App() {
  const [activeRoom, setActiveRoom] = useState<ActiveRoomData | null>(null);
  const [language, setLanguage] = useState<Language>('es');

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      {activeRoom ? (
        <RoomScreen
          roomId={activeRoom.roomId}
          userName={activeRoom.userName}
          isHost={activeRoom.isHost}
          initialVideoId={activeRoom.initialVideoId}
          currentLanguage={language}
          onLanguageChange={setLanguage}
          onLeaveRoom={() => setActiveRoom(null)}
        />
      ) : (
        <JoinRoomScreen
          currentLanguage={language}
          onLanguageChange={setLanguage}
          onEnterRoom={(data) => setActiveRoom(data)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PurinTheme.colors.background,
  },
});
