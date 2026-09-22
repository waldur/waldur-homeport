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

/**
 * The portaling props every select in this package shares. Exported so
 * WindowedSelect — which renders react-select directly instead of going
 * through these hooks — spreads the same values rather than repeating them;
 * deliberately not re-exported from the package root, it is internal.
 */
export const defaultPortalingProps = {
  menuPortalTarget: document.body,
  styles: {
    // A modal Radix Dialog (the app drawer) sets `pointer-events: none` on
    // <body> and re-enables only its own content. The portalled menu is
    // outside that content and would inherit `none`, leaving every option
    // unclickable.
    menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
  },
  menuPosition: 'fixed' as const,
  menuPlacement: 'bottom' as const,
  // Matches tailwindStyles.ts's `menuList` cap (`max-h-[260px]`). react-select's
  // own default (300) always wins for `menuList`'s computed `maxHeight` even in
  // `unstyled` mode — it isn't stripped the way padding/color are — so without
  // this override a virtualized menu (VirtualMenuList reads this same prop)
  // renders visibly taller than a non-virtualized one.
  maxMenuHeight: 260,
};

// A table filter renders its menu inline — the hooks below clear
// `menuPortalTarget` — so it needs no portal styles. They are merged with it
// rather than replaced, like any other caller's `styles`.
const tableFilterStyles = {
  menuList: (baseStyles) => ({
    ...baseStyles,
    height: '175px',
  }),
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
        styles: tableFilterStyles,
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
    // Merged, not replaced: a caller passing its own `styles` would otherwise
    // drop the portal z-index and the `pointer-events: auto` above, and the
    // symptom — an unclickable menu inside the modal drawer — surfaces far
    // from the call that caused it. Per-key overrides still win.
    styles: {
      ...defaultPortalingProps.styles,
      ...(isTableFilter ? tableFilterStyles : {}),
      ...props.styles,
    },
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
        styles: tableFilterStyles,
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
    // Merged, not replaced — see the same block in `useSelect` above.
    styles: {
      ...defaultPortalingProps.styles,
      ...(isTableFilter ? tableFilterStyles : {}),
      ...props.styles,
    },
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
