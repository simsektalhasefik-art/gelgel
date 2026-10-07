import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

let showHandler: ((message: string) => void) | null = null;

// Kısa, kendiliğinden kapanan bilgi mesajı. Onay/karar gerektiren durumlar için showAppAlert kullanılır.
export function showToast(message: string) {
  showHandler?.(message);
}

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    showHandler = (msg) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setMessage(msg);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
          setMessage(null);
        });
      }, 2400);
    };
    return () => {
      showHandler = null;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [opacity]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { top: insets.top + 12, opacity }]}
    >
      <Animated.Text style={styles.text}>{message}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  text: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.teal,
    textAlign: 'center',
  },
});
