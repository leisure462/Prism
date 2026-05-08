import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import WebView from 'react-native-webview';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

interface EpubReaderProps {
  bookId: string;
  filePath: string;
  epubCfi?: string;
  theme?: string;
  fontSize?: number;
  onLocationChange?: (cfi: string, percentage: number) => void;
  onToggleMenu?: () => void;
}

export default function EpubReader({
  bookId,
  filePath,
  epubCfi,
  theme = 'vellum',
  fontSize = 18,
  onLocationChange,
  onToggleMenu,
}: EpubReaderProps) {
  const webViewRef = useRef<WebView>(null);

  const sendMessage = useCallback((msg: object) => {
    webViewRef.current?.injectJavaScript(
      `document.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(${JSON.stringify(msg)}) }));`
    );
  }, []);

  useEffect(() => {
    if (filePath) {
      const fileUri = 'file://' + filePath;
      sendMessage({ type: 'load', fileUri, cfi: epubCfi || null });
    }
  }, [filePath]);

  useEffect(() => {
    const sizePercent = Math.round((fontSize / 16) * 100);
    sendMessage({ type: 'setTheme', theme, fontSize: sizePercent });
  }, [theme, fontSize]);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'relocated' && onLocationChange) {
        onLocationChange(data.cfi, data.percentage);
      }
    } catch {
      // Ignore parse errors
    }
  }, [onLocationChange]);

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      const { x } = event;
      const centerLeft = SCREEN_W * 0.35;
      const centerRight = SCREEN_W * 0.65;
      if (x >= centerLeft && x <= centerRight) {
        if (onToggleMenu) runOnJS(onToggleMenu)();
      } else if (x > centerRight) {
        runOnJS(sendMessage)({ type: 'next' });
      } else {
        runOnJS(sendMessage)({ type: 'prev' });
      }
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: 'file:///android_asset/epub-reader.html' }}
          originWhitelist={['file://']}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleMessage}
          style={styles.webview}
          bounces={false}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
