import Svg, { Path, Circle, Line } from 'react-native-svg';

import { colors } from '../theme/colors';

export function EyeIcon({ open, size = 20 }: { open: boolean; size?: number }) {
  if (open) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z"
          stroke={colors.textSecondary}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={12} cy={12} r={3} stroke={colors.textSecondary} strokeWidth={1.8} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z"
        stroke={colors.textSecondary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3} stroke={colors.textSecondary} strokeWidth={1.8} />
      <Line x1={3} y1={21} x2={21} y2={3} stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
