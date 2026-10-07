import { Image, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

export function LogoBadge() {
  return (
    <View style={styles.ringOuter}>
      <View style={styles.ringInner}>
        <Image source={require('../../assets/logo-yuvarlak.png')} style={styles.logo} />
      </View>
    </View>
  );
}

const SIZE = 96;

const styles = StyleSheet.create({
  ringOuter: {
    width: SIZE + 48,
    height: SIZE + 48,
    borderRadius: (SIZE + 48) / 2,
    backgroundColor: colors.coralLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  ringInner: {
    width: SIZE + 20,
    height: SIZE + 20,
    borderRadius: (SIZE + 20) / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 5,
  },
});
