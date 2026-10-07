import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { ReactNode } from 'react';
import type { TextInputProps } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = TextInputProps & {
  label?: string;
  errorText?: string | null;
  rightAccessory?: ReactNode;
};

export function TextField({ label, style, errorText, rightAccessory, ...rest }: Props) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, rightAccessory ? styles.inputWithAccessory : null, style]}
          {...rest}
        />
        {rightAccessory && <View style={styles.accessory}>{rightAccessory}</View>}
      </View>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.bodySemiBold,
    marginBottom: 6,
    fontSize: 14,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 18,
    height: 52,
    fontSize: 16,
    fontFamily: fonts.bodyMedium,
    color: colors.text,
  },
  inputWithAccessory: {
    paddingRight: 48,
  },
  accessory: {
    position: 'absolute',
    right: 16,
    height: 52,
    justifyContent: 'center',
  },
  errorText: {
    color: colors.coralDark,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    marginTop: 6,
  },
});
