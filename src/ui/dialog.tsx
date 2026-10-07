import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export type DialogButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type DialogRequest = {
  title: string;
  message?: string;
  buttons: DialogButton[];
};

let showHandler: ((request: DialogRequest) => void) | null = null;

// Alert.alert'in yerini alan, marka temasına uygun onay/bilgi penceresi.
// Çağrı şekli bilinçli olarak Alert.alert'e benzer tutuldu: title, message, buttons.
export function showAppAlert(title: string, message?: string, buttons?: DialogButton[]) {
  const finalButtons = buttons && buttons.length > 0 ? buttons : [{ text: 'Tamam' }];
  showHandler?.({ title, message, buttons: finalButtons });
}

export function DialogHost() {
  const [request, setRequest] = useState<DialogRequest | null>(null);

  useEffect(() => {
    showHandler = (req) => setRequest(req);
    return () => {
      showHandler = null;
    };
  }, []);

  if (!request) {
    return null;
  }

  const close = (onPress?: () => void) => {
    setRequest(null);
    onPress?.();
  };

  const cancelButton = request.buttons.find((b) => b.style === 'cancel');
  const optionButtons = request.buttons.filter((b) => b.style !== 'cancel');
  const isActionSheet = request.buttons.length > 2;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => setRequest(null)}>
      <View style={styles.backdrop}>
        {isActionSheet ? (
          <View style={styles.sheetWrap}>
            <View style={styles.sheetCard}>
              <Text style={styles.sheetTitle}>{request.title}</Text>
              {request.message ? <Text style={styles.sheetMessage}>{request.message}</Text> : null}
              {optionButtons.map((button, index) => (
                <Pressable
                  key={index}
                  style={[styles.sheetRow, index === optionButtons.length - 1 && styles.sheetRowLast]}
                  onPress={() => close(button.onPress)}
                >
                  <Text style={styles.sheetRowText}>{button.text}</Text>
                </Pressable>
              ))}
            </View>
            {cancelButton && (
              <Pressable style={styles.cancelPill} onPress={() => close(cancelButton.onPress)}>
                <Text style={styles.cancelPillText}>{cancelButton.text}</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>{request.title}</Text>
            {request.message ? <Text style={styles.message}>{request.message}</Text> : null}
            <View style={styles.buttons}>
              {request.buttons.map((button, index) =>
                button.style === 'cancel' ? (
                  <Pressable key={index} style={styles.secondaryPill} onPress={() => close(button.onPress)}>
                    <Text style={styles.secondaryPillText}>{button.text}</Text>
                  </Pressable>
                ) : (
                  <Pressable key={index} style={styles.primaryPill} onPress={() => close(button.onPress)}>
                    <Text style={styles.primaryPillText}>{button.text}</Text>
                  </Pressable>
                )
              )}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42,35,33,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 19,
    color: colors.teal,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },
  buttons: {
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  primaryPill: {
    backgroundColor: colors.coralDark,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.white,
  },
  secondaryPill: {
    backgroundColor: colors.coralLight,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.coralDark,
  },
  sheetWrap: {
    width: '100%',
    maxWidth: 340,
  },
  sheetCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  sheetTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.teal,
    textAlign: 'center',
  },
  sheetMessage: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  sheetRow: {
    marginTop: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    alignItems: 'center',
  },
  sheetRowLast: {
    borderBottomWidth: 0,
  },
  sheetRowText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.coralDark,
  },
  cancelPill: {
    marginTop: 12,
    backgroundColor: colors.coralLight,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.coralDark,
  },
});
