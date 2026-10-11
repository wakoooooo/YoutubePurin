import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { PurinTheme } from '../theme/colors';

interface YoutubePlayerContainerProps {
  videoId: string;
  playing: boolean;
  onStateChange: (state: string) => void;
  title?: string;
  isHost?: boolean;
  statusBadgeText?: string;
}

export const YoutubePlayerContainer: React.FC<YoutubePlayerContainerProps> = ({
  videoId,
  playing,
  onStateChange,
  title = 'YouTube Video',
  isHost = false,
  statusBadgeText,
}) => {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [isReady, setIsReady] = useState(false);

  // Dimensiones exactas calculadas para 16:9
  const windowWidth = Dimensions.get('window').width;
  // Margen horizontal de pantalla: 32px (16 de cada lado), borde contenedor: 6px
  const playerWidth = Math.floor(windowWidth - 38);
  const playerHeight = Math.floor(playerWidth * (9 / 16));

  useEffect(() => {
    // Si cambia el video, reiniciar estado de preparacion
    setIsReady(false);
  }, [videoId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.indicatorRow}>
          <View
            style={[
              styles.liveDot,
              { backgroundColor: isReady ? PurinTheme.colors.statusOnline : '#FFA000' },
            ]}
          />
          <Text numberOfLines={1} style={styles.titleText}>
            {title}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {statusBadgeText || (isHost ? 'Anfitrion' : 'Sincronizado')}
          </Text>
        </View>
      </View>

      <View style={[styles.playerFrame, { height: playerHeight, width: playerWidth }]}>
        <YoutubePlayer
          ref={playerRef}
          width={playerWidth}
          height={playerHeight}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          onReady={() => setIsReady(true)}
          forceAndroidAutoplay={true}
          webViewStyle={styles.webViewStyle}
          webViewProps={{
            allowsFullscreenVideo: true,
            androidLayerType: 'hardware',
            renderToHardwareTextureAndroid: true,
            androidHardwareAccelerationDisabled: false,
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
            style: styles.webViewStyle,
          }}
          initialPlayerParams={{
            preventFullScreen: false,
            showClosedCaptions: false,
            controls: true,
            rel: false,
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
    alignItems: 'center',
  },
  header: {
    width: '100%',
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
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewStyle: {
    backgroundColor: '#000000',
    opacity: 0.99,
  },
});
