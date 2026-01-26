import {
  CaretDownIcon,
  MagnifyingGlassIcon,
  XIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import { FC } from 'react';
import { FormCheck, OverlayTrigger, Popover } from 'react-bootstrap';
import BaseSelect, {
  ClearIndicatorProps,
  components,
  ControlProps,
  DropdownIndicatorProps,
  MultiValueProps,
  Props as SelectProps,
  ThemeConfig,
} from 'react-select';
import CreatableSelect from 'react-select/creatable';
import {
  AsyncPaginate as BaseAsyncPaginate,
  withAsyncPaginate,
} from 'react-select-async-paginate';
import BaseWindowedSelect from 'react-windowed-select';
import { BaseFieldProps } from 'redux-form';

import { Tag } from '@waldur/core/Tag';
import { translate } from '@waldur/i18n';
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
  return (
    <components.ClearIndicator {...props}>
      <XIcon size={16} weight="bold" />
    </components.ClearIndicator>
  );
};

const SelectDropdownIndicator = (props: DropdownIndicatorProps) => (
  <components.DropdownIndicator {...props}>
    <CaretDownIcon size={20} weight="bold" />
  </components.DropdownIndicator>
);

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
      <FormCheck
        className="form-check form-check-custom form-check-sm lh-1 min-h-auto"
        checked={props.isSelected}
        readOnly
      />
      <label>{props.label}</label>
    </components.Option>
  );
};
export const MultiSelectValue = (props: MultiValueProps) => (
  <Tag onClear={props.removeProps.onClick}>{props.children}</Tag>
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
          <Tag>+{hiddenValues.length}</Tag>
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

// Utility to reorder options: selected options at the top (for both isMulti and single)
const reorderOptions = (options, value, getOptionValue, isMulti) => {
  if (!Array.isArray(options) || value === null) return options;
  if (isMulti) {
    if (!Array.isArray(value) || value.length === 0) return options;
    const selectedValues = new Set(value.map(getOptionValue));
    const selectedOptions = options.filter((opt) =>
      selectedValues.has(getOptionValue(opt)),
    );
    const unselectedOptions = options.filter(
      (opt) => !selectedValues.has(getOptionValue(opt)),
    );
    return [...selectedOptions, ...unselectedOptions];
  } else {
    // single select
    const selectedValue = getOptionValue(value);
    const selectedOption = options.find(
      (opt) => getOptionValue(opt) === selectedValue,
    );
    const unselectedOptions = options.filter(
      (opt) => getOptionValue(opt) !== selectedValue,
    );
    return selectedOption ? [selectedOption, ...unselectedOptions] : options;
  }
};

// Utility to reorder options for async select: selected options at the top (for both isMulti and single)
const reorderAsyncOptions = (options, value, getOptionValue, isMulti, page) => {
  if (!Array.isArray(options) || value === null) return options;
  if (isMulti) {
    if (!Array.isArray(value) || value.length === 0) return options;
    const selectedValues = new Set(value.map(getOptionValue));
    const unselectedOptions = options.filter(
      (opt) => !selectedValues.has(getOptionValue(opt)),
    );

    if (page === 1) {
      return value.concat(unselectedOptions);
    }
    return unselectedOptions;
  } else {
    const selectedValue = getOptionValue(value);
    const selectedOption = options.find(
      (opt) => getOptionValue(opt) === selectedValue,
    );
    const unselectedOptions = options.filter(
      (opt) => getOptionValue(opt) !== selectedValue,
    );

    if (page === 1) {
      if (selectedOption) return [selectedOption].concat(unselectedOptions);
      else if (value) return [value].concat(options);
      else return options;
    }
    if (selectedOption) return unselectedOptions;
    return options;
  }
};

const composeComponents = (components, isMulti) => {
  const commonComponents = {
    ClearIndicator: FilterSelectClearIndicator,
    DropdownIndicator: SelectDropdownIndicator,
  };
  return isMulti
    ? {
        ...REACT_MULTI_SELECT.components,
        ...commonComponents,
        ...components,
      }
    : { ...commonComponents, ...components };
};

export const Select: FC<CustomSelectProps> = ({
  components = undefined,
  size = undefined,
  creatable = false,
  ...props
}) => {
  const theme = useSelectTheme();
  const composedComponents = composeComponents(components, props.isMulti);
  const className = classNames(
    'metronic-select-container',
    size === 'sm' && 'select-sm',
    props.className,
  );

  // Reorder options so selected option(s) are always at the top
  let options = props.options;
  const getOptionValue = props.getOptionValue || ((option) => option.value);
  if (props.menuIsOpen && Array.isArray(options) && props.value !== null) {
    options = reorderOptions(
      options,
      props.value,
      getOptionValue,
      props.isMulti,
    );
  }

  return !creatable ? (
    <BaseSelect
      theme={theme}
      placeholder={translate('Select...')}
      {...(props.isMulti ? REACT_MULTI_SELECT : REACT_SELECT_MENU_PORTALING)}
      components={composedComponents}
      {...props}
      options={options}
      className={className}
      classNamePrefix="metronic-select"
    />
  ) : (
    <CreatableSelect
      theme={theme}
      placeholder={translate('Select or type to add a new option...')}
      {...(props.isMulti ? REACT_MULTI_SELECT : REACT_SELECT_MENU_PORTALING)}
      components={composedComponents}
      {...props}
      options={options}
      className={className}
      classNamePrefix="metronic-select"
    />
  );
};

export const AsyncPaginate: FC<any> = ({
  components = undefined,
  ...props
}) => {
  const theme = useSelectTheme();

  const getOptionValue = props.getOptionValue || ((option) => option.value);
  let wrappedLoadOptions;
  if (props.menuIsOpen && props.loadOptions) {
    wrappedLoadOptions = async (query, prevOptions, additional) => {
      const result = await props.loadOptions(query, prevOptions, additional);
      return {
        ...result,
        options: reorderAsyncOptions(
          result.options,
          props.value,
          getOptionValue,
          props.isMulti,
          additional?.page,
        ),
      };
    };
  }

  const composedComponents = composeComponents(components, props.isMulti);

  return (
    <BaseAsyncPaginate
      theme={theme}
      additional={{
        page: 1,
      }}
      {...REACT_SELECT_MENU_PORTALING}
      components={composedComponents}
      {...props}
      className={classNames('metronic-select-container', props.className)}
      classNamePrefix="metronic-select"
      loadOptions={wrappedLoadOptions || props.loadOptions}
    />
  );
};

const BaseAsyncCreatablePaginate = withAsyncPaginate(CreatableSelect);

export const AsyncCreatablePaginate: FC<any> = ({
  components = undefined,
  ...props
}) => {
  const theme = useSelectTheme();

  const getOptionValue = props.getOptionValue || ((option) => option.value);
  let wrappedLoadOptions;
  if (props.menuIsOpen && props.loadOptions) {
    wrappedLoadOptions = async (query, prevOptions, additional) => {
      const result = await props.loadOptions(query, prevOptions, additional);
      return {
        ...result,
        options: reorderAsyncOptions(
          result.options,
          props.value,
          getOptionValue,
          props.isMulti,
          additional?.page,
        ),
      };
    };
  }

  const composedComponents = composeComponents(components, props.isMulti);

  return (
    <BaseAsyncCreatablePaginate
      theme={theme}
      additional={{
        page: 1,
      }}
      {...REACT_SELECT_MENU_PORTALING}
      components={composedComponents}
      {...props}
      className={classNames('metronic-select-container', props.className)}
      classNamePrefix="metronic-select"
      loadOptions={wrappedLoadOptions || props.loadOptions}
    />
  );
};

export const WindowedSelect = ({ components = undefined, ...props }) => {
  const theme = useSelectTheme();
  const composedComponents = composeComponents(components, props.isMulti);
  return (
    <BaseWindowedSelect
      theme={theme}
      {...REACT_SELECT_MENU_PORTALING}
      components={composedComponents}
      {...(props as any)}
    />
  );
};
