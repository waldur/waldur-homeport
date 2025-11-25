import { useTheme } from '@waldur/theme/useTheme';

import Bg from './Background.svg';
import BgDark from './BackgroundDark.svg';

export const RadialBg = ({ className }: { className?: string }) => {
  const { theme } = useTheme();

  return theme === 'dark' ? (
    <BgDark className={className} />
  ) : (
    <Bg className={className} />
  );
};
