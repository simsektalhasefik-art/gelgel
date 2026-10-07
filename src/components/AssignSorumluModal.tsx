import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AttendanceEntry } from '../lib/meetings';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Avatar } from './Avatar';

export function AssignSorumluModal({
  visible,
  members,
  currentSorumluId,
  onClose,
  onPick,
}: {
  visible: boolean;
  members: AttendanceEntry[];
  currentSorumluId: string | null;
  onClose: () => void;
  onPick: (userId: string | null) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Bu haftanın sorumlusu</Text>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
            <Text style={styles.closeText}>Kapat</Text>
          </Pressable>
        </View>

        {currentSorumluId && (
          <Pressable style={styles.removeRow} onPress={() => onPick(null)}>
            <Text style={styles.removeText}>Sorumluluğu kaldır</Text>
          </Pressable>
        )}

        <FlatList
          data={members}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => onPick(item.user_id)}>
              <Avatar avatarPath={item.avatar_url} firstName={item.first_name} lastName={item.last_name} size={40} />
              <Text style={styles.name}>
                {item.first_name} {item.last_name}
              </Text>
              {currentSorumluId === item.user_id && <Text style={styles.selectedTag}>Seçili</Text>}
            </Pressable>
          )}
        />
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
  removeRow: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: colors.coralLight,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  removeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.coralDark,
  },
  list: {
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  name: {
    flex: 1,
    marginLeft: 12,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.text,
  },
  selectedTag: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.teal,
  },
});
