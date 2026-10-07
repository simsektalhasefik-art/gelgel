import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function QrScannerModal({
  visible,
  onClose,
  onScanned,
}: {
  visible: boolean;
  onClose: () => void;
  onScanned: (code: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const handledRef = useRef(false);

  useEffect(() => {
    if (visible) {
      handledRef.current = false;
      if (!permission?.granted) {
        requestPermission();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>QR ile yoklama</Text>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
            <Text style={styles.closeText}>Kapat</Text>
          </Pressable>
        </View>
        <View style={styles.body}>
          {!permission ? (
            <ActivityIndicator color={colors.coralDark} />
          ) : !permission.granted ? (
            <Text style={styles.hint}>Kamera izni vermelisin.</Text>
          ) : (
            visible && (
              <View style={styles.cameraWrap}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={(result) => {
                    if (handledRef.current) return;
                    handledRef.current = true;
                    onScanned(result.data);
                  }}
                />
                <View style={styles.frame} pointerEvents="none" />
              </View>
            )
          )}
          <Text style={styles.hint}>Yöneticinin ekranındaki QR kodu kameraya göster.</Text>
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
    padding: 24,
  },
  cameraWrap: {
    width: 260,
    height: 260,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  frame: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.coralDark,
  },
  hint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
});
