import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AYDINLATMA_METNI } from '../content/aydinlatmaMetni';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function PrivacyNoticeModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Aydınlatma metni</Text>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
            <Text style={styles.closeText}>Kapat</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.bodyText}>{AYDINLATMA_METNI}</Text>
        </ScrollView>
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
    padding: 24,
  },
  bodyText: {
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 23,
  },
});
