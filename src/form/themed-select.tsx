import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import BaseSelect, {
  components,
  ClearIndicatorProps,
  Props as SelectProps,
  ThemeConfig,
  ControlProps,
} from 'react-select';
import { AsyncPaginate as BaseAsyncPaginate } from 'react-select-async-paginate';
import BaseWindowedSelect from 'react-windowed-select';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

const REACT_SELECT_MENU_PORTALING: Partial<SelectProps> = {
  menuPortalTarget: document.body,
  styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
  menuPosition: 'fixed',
  menuPlacement: 'bottom',
};

export const REACT_SELECT_MENU_NO_PORTALING: Partial<SelectProps> = {
  menuPortalTarget: undefined,
  styles: undefined,
  menuPosition: undefined,
  menuPlacement: undefined,
};

export const FilterSelectClearIndicator = (props: ClearIndicatorProps) => {
  const {
    innerProps: { ref, ...restInnerProps },
  } = props;
  return (
    <div {...restInnerProps} ref={ref}>
      <div
        style={{ padding: '0px 5px', marginRight: '7px', cursor: 'pointer' }}
      >
        <X size={20} weight="bold" className="text-grey-500" />
      </div>
    </div>
  );
};

export const FilterSelectControl = ({ children, ...props }: ControlProps) => (
  <components.Control {...props}>
    {!(props.hasValue && props.selectProps.components.SingleValue) && (
      <MagnifyingGlass size={20} weight="bold" className="text-grey-500 ms-3" />
    )}
    {children}
  </components.Control>
);

export const REACT_SELECT_TABLE_FILTER: Partial<SelectProps> = {
  className: 'metronic-select-container',
  classNamePrefix: 'metronic-select',
  menuIsOpen: true,
  components: {
    Control: FilterSelectControl,
    ClearIndicator: FilterSelectClearIndicator,
  },
  ...REACT_SELECT_MENU_NO_PORTALING,
};

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
    <BaseSelect
      theme={theme}
      placeholder={translate('Select') + '...'}
      {...REACT_SELECT_MENU_PORTALING}
      {...props}
    />
  );
};

export const AsyncPaginate: FC<any> = (props) => {
  const theme = useTheme();
  return (
    <BaseAsyncPaginate
      theme={theme}
      additional={{
        page: 1,
      }}
      {...REACT_SELECT_MENU_PORTALING}
      {...props}
    />
  );
};

export const WindowedSelect = (props) => {
  const theme = useTheme();
  return (
    <BaseWindowedSelect
      theme={theme}
      {...REACT_SELECT_MENU_PORTALING}
      {...props}
    />
  );
};
