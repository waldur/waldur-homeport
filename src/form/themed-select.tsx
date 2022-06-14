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
  primary50: '#4B5563',
  primary25: '#4B5563',
  neutral20: '#4B5563',
  neutral50: '#4B5563',
  neutral0: '#1b1b29',
  neutral80: 'white',
  neutral30: '#4B5563',
};

const useTheme = (): ThemeConfig => {
  const theme = useSelector((state: RootState) => state.theme.theme);
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
