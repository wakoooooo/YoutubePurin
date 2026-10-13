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
  isCompact?: boolean;
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
      isCompact = false,
    },
    ref
  ) => {
    const webViewRef = useRef<WebView>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [currentVideoId, setCurrentVideoId] = useState(videoId);

    const { width: windowWidth } = useWindowDimensions();
    const playerWidth = Math.floor(windowWidth - 32);
    const defaultHeight = Math.floor(playerWidth * (9 / 16));
    const activeHeight = isCompact ? 108 : defaultHeight;

    // Sincronizar videoId si cambia por props
    useEffect(() => {
      if (videoId && videoId !== currentVideoId) {
        setCurrentVideoId(videoId);
        setIsPlayerReady(false);
      }
    }, [videoId]);

    // HTML Wrapper con encabezados de Referer validos y dominio youtube-nocookie para prevenir Error 153
    const htmlWrapper = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background-color: #000; overflow: hidden; }
    #yt-iframe { width: 100%; height: 100%; border: 0; display: block; }
  </style>
</head>
<body>
  <iframe
    id="yt-iframe"
    src="https://www.youtube-nocookie.com/embed/${currentVideoId}?enablejsapi=1&autoplay=1&playsinline=1&controls=1&rel=0&iv_load_policy=3&modestbranding=1"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>

  <script>
    var iframe = document.getElementById('yt-iframe');

    function postCmd(func, args) {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: func,
          args: args || ''
        }), '*');
      }
    }

    window.addEventListener('message', function(event) {
      try {
        var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        if (data.event === 'onStateChange') {
          var stateMap = {
            '-1': 'unstarted',
            '0': 'ended',
            '1': 'playing',
            '2': 'paused',
            '3': 'buffering',
            '5': 'cued'
          };
          var stateName = stateMap[data.info] || 'unknown';
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'stateChange', data: stateName }));
          }
        } else if (data.event === 'initialDelivery') {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready', data: true }));
          }
        }
      } catch (e) {}
    });
  </script>
</body>
</html>
    `;

    useImperativeHandle(
      ref,
      () => ({
        playVideo: () => {
          webViewRef.current?.injectJavaScript("postCmd('playVideo'); true;");
        },
        pauseVideo: () => {
          webViewRef.current?.injectJavaScript("postCmd('pauseVideo'); true;");
        },
        seekTo: (seconds: number) => {
          webViewRef.current?.injectJavaScript(
            `postCmd('seekTo', [${seconds}, true]); true;`
          );
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
        {!isCompact && (
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
        )}

        <View
          style={[
            styles.playerFrame,
            { height: activeHeight, width: playerWidth },
          ]}
        >
          <WebView
            ref={webViewRef}
            key={currentVideoId}
            source={{
              html: htmlWrapper,
              baseUrl: 'https://www.youtube-nocookie.com',
            }}
            onMessage={handleMessage}
            style={[
              styles.webViewStyle,
              { width: playerWidth, height: activeHeight },
            ]}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            androidLayerType="hardware"
            renderToHardwareTextureAndroid={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
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
    marginBottom: 6,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
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
