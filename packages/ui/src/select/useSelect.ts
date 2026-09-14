import { useMemo } from 'react';

import { FilterSelectControl } from './components';
import {
  composeComponents,
  reorderAsyncOptions,
  reorderOptions,
} from './SelectHelper';
import { getSelectTailwindClassNames } from './tailwindStyles';
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
  // Matches tailwindStyles.ts's `menuList` cap (`max-h-[260px]`). react-select's
  // own default (300) always wins for `menuList`'s computed `maxHeight` even in
  // `unstyled` mode — it isn't stripped the way padding/color are — so without
  // this override a virtualized menu (VirtualMenuList reads this same prop)
  // renders visibly taller than a non-virtualized one.
  maxMenuHeight: 260,
};

export const useSelect = <
  T extends CustomSelectProps | CustomCreatableSelectProps,
>(
  props: T,
) => {
  const isTableFilter = props.variant === 'tableFilter';

  const composedComponents = composeComponents(
    {
      ...(isTableFilter ? { Control: FilterSelectControl } : {}),
      ...props.components,
    },
    props.isMulti,
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

  const isDisabled = props.isDisabled || props.disabled;

  const classNamesConfig = useMemo(
    () =>
      getSelectTailwindClassNames({
        size: props.size,
        variant: props.variant,
        hasError: Boolean(props.meta?.touched && props.meta?.error),
      }),
    [props.size, props.variant, props.meta?.touched, props.meta?.error],
  );

  return {
    ...defaultPortalingProps,
    ...multiProps,
    ...tableFilterProps,
    components: composedComponents,
    ...props,
    unstyled: true,
    classNames: classNamesConfig,
    isDisabled,
    inputId: props.inputId || props.id,
    id: undefined,
    value,
    options,
    onChange,
    onBlur,
  };
};

export const useAsyncSelect = <
  T extends CustomAsyncSelectProps | CustomAsyncCreatableSelectProps,
>(
  props: T,
) => {
  const isTableFilter = props.variant === 'tableFilter';

  const composedComponents = composeComponents(
    {
      ...(isTableFilter ? { Control: FilterSelectControl } : {}),
      ...props.components,
    },
    props.isMulti,
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

  const isDisabled = props.isDisabled || props.disabled;

  const classNamesConfig = useMemo(
    () =>
      getSelectTailwindClassNames({
        size: props.size,
        variant: props.variant,
        hasError: Boolean(props.meta?.touched && props.meta?.error),
      }),
    [props.size, props.variant, props.meta?.touched, props.meta?.error],
  );

  return {
    additional: { page: 1 },
    ...defaultPortalingProps,
    ...multiProps,
    ...tableFilterProps,
    components: composedComponents,
    ...props,
    unstyled: true,
    classNames: classNamesConfig,
    isDisabled,
    inputId: props.inputId || props.id,
    id: undefined,
    value,
    onChange,
    onBlur,
    loadOptions,
  };
};
