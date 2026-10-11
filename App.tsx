import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { PurinTheme } from './src/theme/colors';
import { JoinRoomScreen } from './src/screens/JoinRoomScreen';
import { RoomScreen } from './src/screens/RoomScreen';

interface ActiveRoomData {
  roomId: string;
  userName: string;
  isHost: boolean;
  initialVideoId?: string;
}

export default function App() {
  const [activeRoom, setActiveRoom] = useState<ActiveRoomData | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      {activeRoom ? (
        <RoomScreen
          roomId={activeRoom.roomId}
          userName={activeRoom.userName}
          isHost={activeRoom.isHost}
          initialVideoId={activeRoom.initialVideoId}
          onLeaveRoom={() => setActiveRoom(null)}
        />
      ) : (
        <JoinRoomScreen
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
