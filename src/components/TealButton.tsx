import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

// Marka kılavuzu: "Geldim" onayı çini renginde olmalı, diğer ana eylemlerden
// (koyu mercan) bilinçli olarak ayrışır.
export function TealButton({ label, onPress, disabled, loading }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.arrowCircle}>
            <Text style={styles.arrow}>→</Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.teal,
    borderRadius: 999,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
    shadowOpacity: 0,
  },
  label: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fonts.heading,
    marginLeft: 24,
  },
  arrowCircle: {
    position: 'absolute',
    right: 6,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.heading,
  },
});
