import classNames from 'classnames';
import { useMemo } from 'react';

import { FilterSelectControl } from './components';
import {
  composeComponents,
  reorderAsyncOptions,
  reorderOptions,
} from './SelectHelper';
import { useSelectTheme } from './theme';
import {
  CustomAsyncCreatableSelectProps,
  CustomAsyncSelectProps,
  CustomCreatableSelectProps,
  CustomSelectProps,
} from './types';

const defaultPortalingProps = {
  menuPortalTarget: document.body,
  styles: { menuPortal: (base) => ({ ...base, zIndex: 9999 }) },
  menuPosition: 'fixed' as const,
  menuPlacement: 'bottom' as const,
};

export const useSelect = <
  T extends CustomSelectProps | CustomCreatableSelectProps,
>(
  props: T,
) => {
  const theme = useSelectTheme();
  const isTableFilter = props.variant === 'tableFilter';

  const composedComponents = composeComponents(
    {
      ...(isTableFilter ? { Control: FilterSelectControl } : {}),
      ...props.components,
    },
    props.isMulti,
  );

  const className = classNames(
    'metronic-select-container',
    props.size === 'sm' && 'select-sm',
    props.className,
  );

  const getOptionValue =
    props.getOptionValue || ((option: any) => option.value);

  const value = props.input ? props.input.value : props.value;

  const menuIsOpen = props.menuIsOpen || isTableFilter;

  const options = useMemo(() => {
    if (menuIsOpen && Array.isArray(props.options) && value !== null) {
      return reorderOptions(
        props.options,
        value,
        getOptionValue,
        props.isMulti,
      );
    }
    return props.options;
  }, [menuIsOpen, props.options, value, getOptionValue, props.isMulti]);

  const onChange = (newValue, actionMeta) => {
    if (props.input) {
      props.input.onChange(newValue);
    }
    if (props.onChange) {
      props.onChange(newValue, actionMeta);
    }
  };

  const onBlur = (event) => {
    if (props.input) {
      props.input.onBlur(event);
    }
    if (props.onBlur) {
      props.onBlur(event);
    }
  };

  const tableFilterProps = isTableFilter
    ? {
        autoFocus: true,
        menuIsOpen: true,
        menuPortalTarget: undefined,
        menuPosition: undefined,
        menuPlacement: undefined,
        styles: {
          menuList: (baseStyles) => ({
            ...baseStyles,
            height: '175px',
          }),
        },
      }
    : {};

  const multiProps = props.isMulti
    ? {
        hideSelectedOptions: false,
        closeMenuOnSelect: false,
      }
    : {};

  return {
    theme,
    ...defaultPortalingProps,
    ...multiProps,
    ...tableFilterProps,
    components: composedComponents,
    ...props,
    inputId: props.inputId || props.id,
    id: undefined,
    value,
    options,
    onChange,
    onBlur,
    className,
    classNamePrefix: 'metronic-select',
  };
};

export const useAsyncSelect = <
  T extends CustomAsyncSelectProps | CustomAsyncCreatableSelectProps,
>(
  props: T,
) => {
  const theme = useSelectTheme();
  const isTableFilter = props.variant === 'tableFilter';

  const composedComponents = composeComponents(
    {
      ...(isTableFilter ? { Control: FilterSelectControl } : {}),
      ...props.components,
    },
    props.isMulti,
  );

  const className = classNames(
    'metronic-select-container',
    props.size === 'sm' && 'select-sm',
    props.className,
  );

  const getOptionValue =
    props.getOptionValue || ((option: any) => option.value);

  const value = props.input ? props.input.value : props.value;

  const menuIsOpen = props.menuIsOpen || isTableFilter;

  const loadOptions = useMemo(() => {
    if (menuIsOpen && props.loadOptions) {
      return async (query: string, prevOptions: any, additional: any) => {
        const result = await props.loadOptions!(query, prevOptions, additional);
        if (!result || !Array.isArray(result.options)) {
          return result;
        }
        return {
          ...result,
          options: reorderAsyncOptions(
            result.options,
            value,
            getOptionValue,
            props.isMulti,
            additional?.page,
          ),
        };
      };
    }
    return props.loadOptions;
  }, [menuIsOpen, props.loadOptions, value, getOptionValue, props.isMulti]);

  const onChange = (newValue, actionMeta) => {
    if (props.input) {
      props.input.onChange(newValue);
    }
    if (props.onChange) {
      props.onChange(newValue, actionMeta);
    }
  };

  const onBlur = (event) => {
    if (props.input) {
      props.input.onBlur(event);
    }
    if (props.onBlur) {
      props.onBlur(event);
    }
  };

  const tableFilterProps = isTableFilter
    ? {
        autoFocus: true,
        menuIsOpen: true,
        menuPortalTarget: undefined,
        menuPosition: undefined,
        menuPlacement: undefined,
        styles: {
          menuList: (baseStyles) => ({
            ...baseStyles,
            height: '175px',
          }),
        },
      }
    : {};

  const multiProps = props.isMulti
    ? {
        hideSelectedOptions: false,
        closeMenuOnSelect: false,
      }
    : {};

  return {
    theme,
    additional: { page: 1 },
    ...defaultPortalingProps,
    ...multiProps,
    ...tableFilterProps,
    components: composedComponents,
    ...props,
    inputId: props.inputId || props.id,
    id: undefined,
    value,
    onChange,
    onBlur,
    className,
    classNamePrefix: 'metronic-select',
    loadOptions,
  };
};
