import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
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

const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36';

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
    const [currentVideoId, setCurrentVideoId] = useState(videoId);

    const { width: windowWidth } = useWindowDimensions();
    const playerWidth = Math.floor(windowWidth - 32);
    const playerHeight = Math.floor(playerWidth * (9 / 16));

    // Sincronizar videoId si cambia por props
    useEffect(() => {
      if (videoId && videoId !== currentVideoId) {
        setCurrentVideoId(videoId);
        setIsPlayerReady(false);
      }
    }, [videoId]);

    const embedUrl = `https://www.youtube.com/embed/${currentVideoId}?playsinline=1&enablejsapi=1&autoplay=1&controls=1&rel=0&iv_load_policy=3&modestbranding=1`;

    const injectedJavaScript = `
      (function() {
        function setupListeners() {
          var v = document.querySelector('video');
          if (v) {
            v.addEventListener('play', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'stateChange', data: 'playing' }));
              }
            });
            v.addEventListener('pause', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'stateChange', data: 'paused' }));
              }
            });
            v.addEventListener('ended', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'stateChange', data: 'ended' }));
              }
            });
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready', data: true }));
            }
          } else {
            setTimeout(setupListeners, 250);
          }
        }
        setupListeners();
        true;
      })();
    `;

    useImperativeHandle(
      ref,
      () => ({
        playVideo: () => {
          const js = `
            try {
              var v = document.querySelector('video');
              if (v) { v.play(); }
              window.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            } catch(e) {}
            true;
          `;
          webViewRef.current?.injectJavaScript(js);
        },
        pauseVideo: () => {
          const js = `
            try {
              var v = document.querySelector('video');
              if (v) { v.pause(); }
              window.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            } catch(e) {}
            true;
          `;
          webViewRef.current?.injectJavaScript(js);
        },
        seekTo: (seconds: number) => {
          const js = `
            try {
              var v = document.querySelector('video');
              if (v) { v.currentTime = ${seconds}; }
              window.postMessage('{"event":"command","func":"seekTo","args":[${seconds}, true]}', '*');
            } catch(e) {}
            true;
          `;
          webViewRef.current?.injectJavaScript(js);
        },
        loadVideo: (newId: string) => {
          setCurrentVideoId(newId);
          setIsPlayerReady(false);
        },
      }),
      []
    );

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const payload = JSON.parse(event.nativeEvent.data);
          if (payload.type === 'ready') {
            setIsPlayerReady(true);
          } else if (payload.type === 'stateChange') {
            onStateChange(payload.data);
          }
        } catch {
          // Ignorar mensajes no compatibles
        }
      },
      [onStateChange]
    );

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
            key={currentVideoId}
            source={{ uri: embedUrl }}
            onMessage={handleMessage}
            injectedJavaScript={injectedJavaScript}
            style={[
              styles.webViewStyle,
              { width: playerWidth, height: playerHeight },
            ]}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            androidLayerType="hardware"
            renderToHardwareTextureAndroid={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="always"
            userAgent={DESKTOP_USER_AGENT}
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
  },
  webViewStyle: {
    backgroundColor: '#000000',
    opacity: 0.99,
  },
});
