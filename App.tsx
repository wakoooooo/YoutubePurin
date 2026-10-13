import React, { useState } from 'react';
import { View, StyleSheet, Platform, StatusBar as RNStatusBar, LogBox } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { PurinTheme } from './src/theme/colors';
import { JoinRoomScreen } from './src/screens/JoinRoomScreen';
import { RoomScreen } from './src/screens/RoomScreen';
import { Language } from './src/i18n/translations';

// Ignorar advertencias internas de red y avisos de deprecacion
LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
  'Setting a timer',
  'Animated: `useNativeDriver`',
  'SafeAreaView has been deprecated',
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PurinTheme.colors.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0,
  },
});
