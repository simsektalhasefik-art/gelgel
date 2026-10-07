import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../theme/colors';

export function MapPinIcon({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={(size * 4) / 3} viewBox="0 0 36 48" fill="none">
      <Path
        d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.059 27.941 0 18 0z"
        fill={colors.coralDark}
      />
      <Circle cx={18} cy={18} r={7} fill={colors.white} />
    </Svg>
  );
}
