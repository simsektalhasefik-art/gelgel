import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import type { NavigationContainerRef } from '@react-navigation/native';

import { AyarlarScreen } from '../screens/AyarlarScreen';
import { GrubaKatilScreen } from '../screens/GrubaKatilScreen';
import { GrupAnaSayfaScreen } from '../screens/GrupAnaSayfaScreen';
import { GrupAyarlariScreen } from '../screens/GrupAyarlariScreen';
import { GrupOlusturScreen } from '../screens/GrupOlusturScreen';
import { GruplarimScreen } from '../screens/GruplarimScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { takePendingInviteCode } from '../lib/pendingInvite';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator({
  navigationRef,
}: {
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}) {
  useEffect(() => {
    const code = takePendingInviteCode();
    if (code) {
      navigationRef.current?.navigate('GrubaKatil', { code });
    }
  }, [navigationRef]);

  return (
    <Stack.Navigator
      initialRouteName="Gruplarim"
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.coralDark,
        headerTitleStyle: { fontFamily: fonts.bodySemiBold, fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.cream },
      }}
    >
      <Stack.Screen name="Gruplarim" component={GruplarimScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GrupOlustur" component={GrupOlusturScreen} options={{ title: 'Grup oluştur' }} />
      <Stack.Screen name="GrubaKatil" component={GrubaKatilScreen} options={{ title: 'Gruba katıl' }} />
      <Stack.Screen name="GrupAnaSayfa" component={GrupAnaSayfaScreen} options={{ title: 'Grup' }} />
      <Stack.Screen name="GrupAyarlari" component={GrupAyarlariScreen} options={{ title: 'Grup ayarları' }} />
      <Stack.Screen name="Profil" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Ayarlar" component={AyarlarScreen} options={{ title: 'Ayarlar' }} />
    </Stack.Navigator>
  );
}
