import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { PurinTheme } from '../theme/colors';

interface YoutubePlayerContainerProps {
  videoId: string;
  playing: boolean;
  onStateChange: (state: string) => void;
  title?: string;
  isHost?: boolean;
}

export const YoutubePlayerContainer: React.FC<YoutubePlayerContainerProps> = ({
  videoId,
  playing,
  onStateChange,
  title = 'Video en reproduccion',
  isHost = false,
}) => {
  const playerRef = useRef<YoutubeIframeRef>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.indicatorRow}>
          <View style={styles.liveDot} />
          <Text numberOfLines={1} style={styles.titleText}>
            {title}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{isHost ? 'Anfitrion' : 'Sincronizado'}</Text>
        </View>
      </View>

      <View style={styles.playerFrame}>
        <YoutubePlayer
          ref={playerRef}
          height={205}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          webViewProps={{
            allowsFullscreenVideo: true,
            androidLayerType: 'hardware',
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3E2723',
    borderRadius: PurinTheme.borders.radiusCard,
    borderWidth: PurinTheme.borders.thick,
    borderColor: PurinTheme.colors.stroke,
    overflow: 'hidden',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#4E342E',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5252',
    marginRight: 6,
  },
  titleText: {
    color: '#FFF8B8',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    backgroundColor: PurinTheme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: PurinTheme.borders.radiusPill,
    borderWidth: PurinTheme.borders.thin,
    borderColor: PurinTheme.colors.stroke,
  },
  badgeText: {
    color: PurinTheme.colors.stroke,
    fontSize: 9,
    fontWeight: '800',
  },
  playerFrame: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
