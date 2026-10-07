import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  active: 'Gruplarim' | 'Profil';
  navigation: NativeStackNavigationProp<RootStackParamList, any>;
};

export function FloatingTabBar({ active, navigation }: Props) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar}>
        <Pressable
          style={[styles.tab, active === 'Gruplarim' && styles.tabActive]}
          onPress={() => navigation.navigate('Gruplarim')}
        >
          <Text style={[styles.label, active === 'Gruplarim' && styles.labelActive]}>Gruplarım</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, active === 'Profil' && styles.tabActive]}
          onPress={() => navigation.navigate('Profil')}
        >
          <Text style={[styles.label, active === 'Profil' && styles.labelActive]}>Profil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 999,
    padding: 6,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: colors.coralDark,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.white,
  },
});
