import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { FloatingTabBar } from '../components/FloatingTabBar';
import { LogoBadge } from '../components/LogoBadge';
import { SecondaryButton } from '../components/SecondaryButton';
import { listMyGroups } from '../lib/groups';
import type { GroupSummary } from '../lib/groups';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Gruplarim'>;

export function GruplarimScreen({ navigation }: Props) {
  const [groups, setGroups] = useState<GroupSummary[] | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      listMyGroups()
        .then((data) => {
          if (!cancelled) setGroups(data);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <LogoBadge />
        <Text style={styles.title}>Gruplarım</Text>

        {loading ? (
          <ActivityIndicator color={colors.coralDark} style={styles.loading} />
        ) : groups && groups.length > 0 ? (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            style={styles.groupList}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => navigation.navigate('GrupAnaSayfa', { groupId: item.id })}
              >
                <Text style={styles.cardTitle}>{item.ad}</Text>
                <Text style={styles.cardArrow}>→</Text>
              </Pressable>
            )}
          />
        ) : (
          <Text style={styles.empty}>Henüz bir grubun yok. Bir grup kur ya da davet kodunla katıl.</Text>
        )}

        <View style={styles.actions}>
          <SecondaryButton label="Grup oluştur" onPress={() => navigation.navigate('GrupOlustur')} />
          <SecondaryButton label="Davet koduyla katıl" onPress={() => navigation.navigate('GrubaKatil')} />
        </View>
      </View>
      <FloatingTabBar active="Gruplarim" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: fonts.heading,
    color: colors.teal,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  loading: {
    marginTop: 32,
  },
  groupList: {
    flex: 1,
  },
  list: {
    paddingBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 17,
    color: colors.text,
  },
  cardArrow: {
    color: colors.coralDark,
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    marginTop: 24,
    lineHeight: 22,
  },
  actions: {
    marginTop: 'auto',
    paddingBottom: 96,
    gap: 12,
  },
});
