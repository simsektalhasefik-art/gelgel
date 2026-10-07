import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

type Props = {
  icon: ReactNode;
  onPress: () => void;
};

// Referans arayüzdeki "daire içinde ikon buton" örüntüsü.
export function CircleIconButton({ icon, onPress }: Props) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.coralLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
