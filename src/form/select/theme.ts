import { ThemeConfig } from 'react-select';

import { useTheme } from '@/theme/useTheme';

const DARK_COLORS = {
  neutral0: '#0c111d',
  neutral10: '#4C6351',
  neutral20: '#4C6351',
  neutral30: '#4C6351',
  neutral50: '#98b38f',
  neutral80: 'white',
  primary25: '#4C6351',
  primary50: '#4C6351',
};

export const useSelectTheme = (): ThemeConfig => {
  const { theme } = useTheme();
  return (boxTheme) => {
    if (theme === 'dark') {
      return {
        ...boxTheme,
        colors: {
          ...boxTheme.colors,
          ...DARK_COLORS,
        },
      };
    }
    return { ...boxTheme };
  };
};
