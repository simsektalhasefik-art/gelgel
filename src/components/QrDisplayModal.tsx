import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

import { getCurrentQrCode } from '../lib/meetings';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const YENILEME_SANIYE = 30;

export function QrDisplayModal({
  visible,
  meetingId,
  onClose,
}: {
  visible: boolean;
  meetingId: string;
  onClose: () => void;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) return;

    const refresh = () => {
      getCurrentQrCode(meetingId)
        .then((c) => {
          setCode(c);
          setError(null);
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'Kod alınamadı.'));
    };

    refresh();
    timerRef.current = setInterval(refresh, YENILEME_SANIYE * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setCode(null);
    };
  }, [visible, meetingId]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Yedek QR</Text>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
            <Text style={styles.closeText}>Kapat</Text>
          </Pressable>
        </View>
        <View style={styles.body}>
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : code ? (
            <View style={styles.qrCard}>
              <QRCode value={code} size={220} color={colors.text} backgroundColor={colors.white} />
            </View>
          ) : (
            <ActivityIndicator color={colors.coralDark} />
          )}
          <Text style={styles.hint}>
            Kod her 30 saniyede bir kendiliğinden yenilenir. Üyeler uygulamadan "QR ile yoklama ver" diyip bunu
            okutsun.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.heading,
    color: colors.teal,
  },
  closeButton: {
    backgroundColor: colors.coralLight,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeText: {
    color: colors.coralDark,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  qrCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
  },
  hint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.coralDark,
    textAlign: 'center',
  },
});
