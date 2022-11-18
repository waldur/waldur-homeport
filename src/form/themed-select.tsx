import { useSelector } from 'react-redux';
import BaseSelect, { Props as SelectProps } from 'react-select';
import { AsyncPaginate as BaseAsyncPaginate } from 'react-select-async-paginate';
import { ThemeConfig } from 'react-select/src/theme';
import BaseWindowedSelect from 'react-windowed-select';

import { RootState } from '@waldur/store/reducers';

const reactSelectMenuPortaling = (): Partial<SelectProps> => ({
  menuPortalTarget: document.body,
  styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
  menuPosition: 'fixed',
  menuPlacement: 'bottom',
});

const DARK_COLORS = {
  neutral0: '#1A261D',
  neutral10: '#4C6351',
  neutral20: '#4C6351',
  neutral30: '#4C6351',
  neutral50: '#98b38f',
  neutral80: 'white',
  primary25: '#4C6351',
  primary50: '#4C6351',
};

const useTheme = (): ThemeConfig => {
  const theme = useSelector((state: RootState) => state.theme?.theme);
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

export const Select = (props) => {
  const theme = useTheme();
  return (
    <BaseSelect theme={theme} {...reactSelectMenuPortaling()} {...props} />
  );
};

export const AsyncPaginate = (props) => {
  const theme = useTheme();
  return (
    <BaseAsyncPaginate
      theme={theme}
      {...reactSelectMenuPortaling()}
      {...props}
    />
  );
};

export const WindowedSelect = (props) => {
  const theme = useTheme();
  return (
    <BaseWindowedSelect
      theme={theme}
      {...reactSelectMenuPortaling()}
      {...props}
    />
  );
};
