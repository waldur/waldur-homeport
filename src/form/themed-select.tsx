import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import { FC } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import BaseSelect, {
  ClearIndicatorProps,
  components,
  ControlProps,
  MultiValueProps,
  Props as SelectProps,
  ThemeConfig,
} from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { AsyncPaginate as BaseAsyncPaginate } from 'react-select-async-paginate';
import BaseWindowedSelect from 'react-windowed-select';
import { BaseFieldProps } from 'redux-form';

import { translate } from '@waldur/i18n';
import CheckboxEmptyIcon from '@waldur/table/CheckboxEmpty.svg';
import CheckboxFillIcon from '@waldur/table/CheckboxFill.svg';
import { RemoveFilterBadgeButton } from '@waldur/table/TableFilterItem';
import { useTheme } from '@waldur/theme/useTheme';

const REACT_SELECT_MENU_PORTALING: Partial<SelectProps> = {
  menuPortalTarget: document.body,
  styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
  menuPosition: 'fixed',
  menuPlacement: 'bottom',
};

const REACT_SELECT_MENU_NO_PORTALING: Partial<SelectProps> = {
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
        <XIcon size={20} weight="bold" className="text-gray-500" />
      </div>
    </div>
  );
};

export const FilterSelectControl = ({ children, ...props }: ControlProps) => (
  <components.Control {...props}>
    {!(props.hasValue && props.selectProps.components.SingleValue) && (
      <MagnifyingGlassIcon
        size={20}
        weight="bold"
        className="text-gray-500 ms-3"
      />
    )}
    {children}
  </components.Control>
);

export const MultiSelectOption = (props) => {
  return (
    <components.Option {...props}>
      <span
        className={
          'svg-icon svg-icon-4 ' +
          (props.isSelected ? 'svg-icon-primary' : 'svg-icon-transparent')
        }
      >
        {props.isSelected ? <CheckboxFillIcon /> : <CheckboxEmptyIcon />}
      </span>
      <label>{props.label}</label>
    </components.Option>
  );
};
const MultiSelectValue = (props: MultiValueProps) => (
  <span className="badge">
    {props.children}
    <RemoveFilterBadgeButton size={12} onClick={props.removeProps.onClick} />
  </span>
);

const MultiSelectLimitedValueContainer = (props) => {
  if (!props.hasValue) {
    return (
      <components.ValueContainer {...props}>
        {props.children}
      </components.ValueContainer>
    );
  }

  const valuesLimit = 2;
  const [values, ...otherChildren] = props.children;
  const hiddenValues = values.slice(valuesLimit);
  const displayValues = values.slice(0, valuesLimit);

  return (
    <components.ValueContainer {...props}>
      {displayValues}

      {hiddenValues.length > 0 && (
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Popover
              className="metronic-select-tooltip"
              id={uniqueId('tip-multiselect')}
            >
              <Popover.Body>
                {hiddenValues.map((child) => child.props?.children).join(', ')}
              </Popover.Body>
            </Popover>
          }
        >
          <span className="badge">+{hiddenValues.length}</span>
        </OverlayTrigger>
      )}

      {otherChildren}
    </components.ValueContainer>
  );
};

export const REACT_SELECT_TABLE_FILTER: Partial<SelectProps> = {
  className: 'metronic-select-container',
  classNamePrefix: 'metronic-select',
  autoFocus: true,
  menuIsOpen: true,
  components: {
    Control: FilterSelectControl,
    ClearIndicator: FilterSelectClearIndicator,
  },
  ...REACT_SELECT_MENU_NO_PORTALING,
  styles: {
    menuList: (baseStyles) => ({
      ...baseStyles,
      height: '175px',
    }),
  },
};

export const REACT_MULTI_SELECT_TABLE_FILTER: Partial<SelectProps> = {
  ...REACT_SELECT_TABLE_FILTER,
  isMulti: true,
  hideSelectedOptions: false,
  closeMenuOnSelect: false,
  components: {
    ...REACT_SELECT_TABLE_FILTER.components,
    Option: MultiSelectOption,
    MultiValue: MultiSelectValue,
    ValueContainer: MultiSelectLimitedValueContainer,
  },
};

const REACT_MULTI_SELECT: Partial<SelectProps> = {
  className: 'metronic-select-container',
  classNamePrefix: 'metronic-select',
  isMulti: true,
  hideSelectedOptions: false,
  closeMenuOnSelect: false,
  components: {
    Option: MultiSelectOption,
    MultiValue: MultiSelectValue,
    ValueContainer: MultiSelectLimitedValueContainer,
    ClearIndicator: FilterSelectClearIndicator,
  },
  ...REACT_SELECT_MENU_PORTALING,
};

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

const useSelectTheme = (): ThemeConfig => {
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

type CustomSelectProps = {
  size?: 'sm';
  creatable?: boolean;
} & SelectProps<any> &
  Partial<Omit<BaseFieldProps, 'onChange'>>;

export const Select: FC<CustomSelectProps> = ({
  components = undefined,
  size = undefined,
  creatable = false,
  ...props
}) => {
  const theme = useSelectTheme();
  const composedComponents = props.isMulti
    ? { ...REACT_MULTI_SELECT.components, ...components }
    : components;
  const className = classNames(
    'metronic-select-container',
    size === 'sm' && 'select-sm',
    props.className,
  );
  return !creatable ? (
    <BaseSelect
      theme={theme}
      placeholder={translate('Select') + '...'}
      {...(props.isMulti ? REACT_MULTI_SELECT : REACT_SELECT_MENU_PORTALING)}
      components={composedComponents}
      {...props}
      className={className}
      classNamePrefix="metronic-select"
    />
  ) : (
    <CreatableSelect
      theme={theme}
      placeholder={translate('Select or type to add a new option') + '...'}
      {...(props.isMulti ? REACT_MULTI_SELECT : REACT_SELECT_MENU_PORTALING)}
      components={composedComponents}
      {...props}
      className={className}
      classNamePrefix="metronic-select"
    />
  );
};

export const AsyncPaginate: FC<any> = (props) => {
  const theme = useSelectTheme();
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
  const theme = useSelectTheme();
  return (
    <BaseWindowedSelect
      theme={theme}
      {...REACT_SELECT_MENU_PORTALING}
      {...props}
    />
  );
};
