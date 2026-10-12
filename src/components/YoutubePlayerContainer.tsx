import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { PurinTheme } from '../theme/colors';

export interface YoutubePlayerRef {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number) => void;
  loadVideo: (videoId: string) => void;
}

interface YoutubePlayerContainerProps {
  videoId: string;
  playing: boolean;
  onStateChange: (state: string) => void;
  title?: string;
  isHost?: boolean;
  statusBadgeText?: string;
}

export const YoutubePlayerContainer = forwardRef<
  YoutubePlayerRef,
  YoutubePlayerContainerProps
>(
  (
    {
      videoId,
      playing,
      onStateChange,
      title = 'YouTube Video',
      isHost = false,
      statusBadgeText,
    },
    ref
  ) => {
    const webViewRef = useRef<WebView>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const currentVideoIdRef = useRef(videoId);
    const isPlayingRef = useRef(playing);
    isPlayingRef.current = playing;

    const { width: windowWidth } = useWindowDimensions();
    const playerWidth = Math.floor(windowWidth - 32);
    const playerHeight = Math.floor(playerWidth * (9 / 16));

    // Exponer metodos imperativos directos
    useImperativeHandle(
      ref,
      () => ({
        playVideo: () => {
          webViewRef.current?.injectJavaScript(
            'try { if (window.player && window.player.playVideo) window.player.playVideo(); } catch(e){} true;'
          );
        },
        pauseVideo: () => {
          webViewRef.current?.injectJavaScript(
            'try { if (window.player && window.player.pauseVideo) window.player.pauseVideo(); } catch(e){} true;'
          );
        },
        seekTo: (seconds: number) => {
          webViewRef.current?.injectJavaScript(
            `try { if (window.player && window.player.seekTo) window.player.seekTo(${seconds}, true); } catch(e){} true;`
          );
        },
        loadVideo: (newVideoId: string) => {
          currentVideoIdRef.current = newVideoId;
          webViewRef.current?.injectJavaScript(
            `try { if (window.player && window.player.loadVideoById) window.player.loadVideoById("${newVideoId}"); } catch(e){} true;`
          );
        },
      }),
      []
    );

    // Reaccionar a cambios en la prop 'playing'
    useEffect(() => {
      if (!isPlayerReady) return;
      if (playing) {
        webViewRef.current?.injectJavaScript(
          'try { if (window.player && window.player.playVideo) window.player.playVideo(); } catch(e){} true;'
        );
      } else {
        webViewRef.current?.injectJavaScript(
          'try { if (window.player && window.player.pauseVideo) window.player.pauseVideo(); } catch(e){} true;'
        );
      }
    }, [playing, isPlayerReady]);

    // Reaccionar a cambios en la prop 'videoId'
    useEffect(() => {
      if (!isPlayerReady) return;
      if (currentVideoIdRef.current !== videoId) {
        currentVideoIdRef.current = videoId;
        webViewRef.current?.injectJavaScript(
          `try { if (window.player && window.player.loadVideoById) window.player.loadVideoById("${videoId}"); } catch(e){} true;`
        );
      }
    }, [videoId, isPlayerReady]);

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const payload = JSON.parse(event.nativeEvent.data);
          if (payload.type === 'ready') {
            setIsPlayerReady(true);
            if (isPlayingRef.current) {
              webViewRef.current?.injectJavaScript(
                'try { if (window.player && window.player.playVideo) window.player.playVideo(); } catch(e){} true;'
              );
            }
          } else if (payload.type === 'stateChange') {
            onStateChange(payload.data);
          }
        } catch {
          // Ignorar mensajes no compatibles
        }
      },
      [onStateChange]
    );

    // Plantilla HTML optimizada con YouTube IFrame API
    const htmlSource = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background-color: #000; overflow: hidden; }
    #player { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
  </style>
</head>
<body>
  <div id="player"></div>
  <script src="https://www.youtube.com/iframe_api"></script>
  <script>
    var player;
    function notifyRN(type, data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data }));
      }
    }

    function onYouTubeIframeAPIReady() {
      player = new YT.Player('player', {
        width: '100%',
        height: '100%',
        videoId: '${videoId}',
        playerVars: {
          autoplay: ${playing ? 1 : 0},
          playsinline: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          fs: 1,
          enablejsapi: 1,
          origin: 'https://www.youtube.com'
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
      window.player = player;
    }

    function onPlayerReady(event) {
      window.player = player;
      notifyRN('ready', true);
    }

    function onPlayerStateChange(event) {
      var stateMap = {
        '-1': 'unstarted',
        '0': 'ended',
        '1': 'playing',
        '2': 'paused',
        '3': 'buffering',
        '5': 'cued'
      };
      var stateName = stateMap[event.data] || 'unknown';
      notifyRN('stateChange', stateName);
    }
  </script>
</body>
</html>
    `;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.indicatorRow}>
            <View
              style={[
                styles.liveDot,
                {
                  backgroundColor: isPlayerReady
                    ? PurinTheme.colors.statusOnline
                    : '#FFA000',
                },
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

        <View
          style={[
            styles.playerFrame,
            { height: playerHeight, width: playerWidth },
          ]}
        >
          <WebView
            ref={webViewRef}
            source={{
              html: htmlSource,
              baseUrl: 'https://www.youtube.com',
            }}
            onMessage={handleMessage}
            style={styles.webViewStyle}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            androidLayerType="hardware"
            renderToHardwareTextureAndroid={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            userAgent={
              Platform.OS === 'android'
                ? 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Mobile Safari/537.36'
                : undefined
            }
          />
        </View>
      </View>
    );
  }
);

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
    width: '100%',
    height: '100%',
  },
});
