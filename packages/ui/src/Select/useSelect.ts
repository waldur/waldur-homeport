import { useMemo } from 'react';

import { useControlId } from '../Form/controlId';

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

/** The portaling props every select in this package shares. */
const defaultPortalingProps = {
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
  // A long list keeps a fixed height so the menu does not jump while the
  // search narrows it; a short one (up to four 40px rows) fits its rows.
  menuList: (baseStyles, { selectProps }) => ({
    ...baseStyles,
    height: selectProps.options?.length > 4 ? '175px' : undefined,
  }),
};

const defaultGetOptionValue = (option: any) => option.value;

type AnySelectProps =
  | CustomSelectProps
  | CustomCreatableSelectProps
  | CustomAsyncSelectProps
  | CustomAsyncCreatableSelectProps;

/**
 * What every select in this package shares, whatever its option source:
 * control id, components, value and handlers (plain or react-final-form),
 * the table-filter and multi-select behaviour, disabled, and classes.
 */
const useBaseSelectProps = (props: AnySelectProps) => {
  const controlId = useControlId(props.inputId || props.id);
  const isTableFilter = props.variant === 'tableFilter';

  const components = composeComponents(
    {
      ...(isTableFilter ? { Control: FilterSelectControl } : {}),
      ...props.components,
    },
    props.isMulti,
  );

  const classNames = useMemo(
    () =>
      getSelectTailwindClassNames({
        size: props.size,
        variant: props.variant,
        hasError: Boolean(props.meta?.touched && props.meta?.error),
      }),
    [props.size, props.variant, props.meta?.touched, props.meta?.error],
  );

  const onChange = (newValue, actionMeta) => {
    props.input?.onChange?.(newValue);
    props.onChange?.(newValue, actionMeta);
  };

  const onBlur = (event) => {
    props.input?.onBlur?.(event);
    props.onBlur?.(event);
  };

  const tableFilterProps = isTableFilter
    ? {
        autoFocus: true,
        // The filter popover shows one filter at a time, so its menu stays
        // open. Where several filters are expanded together (the mobile
        // sidebar), `menuAlwaysOpen={false}` makes each an ordinary
        // dropdown instead: opened by the autofocus, closed on blur, so only
        // one menu shows at a time.
        ...(props.menuAlwaysOpen === false
          ? { openMenuOnFocus: true }
          : { menuIsOpen: true }),
        menuPortalTarget: undefined,
        menuPosition: undefined,
        menuPlacement: undefined,
      }
    : {};

  const multiProps = props.isMulti
    ? { hideSelectedOptions: false, closeMenuOnSelect: false }
    : {};

  return {
    /** Defaults; the caller's props are spread over these. */
    defaults: { ...defaultPortalingProps, ...multiProps, ...tableFilterProps },
    /** Spread after the caller's props: these always win. */
    overrides: {
      // `composeComponents` already folds in the caller's own `components`,
      // so spreading the raw prop last would drop every default (checkbox
      // options, tags, indicators) as soon as one part is overridden.
      components,
      // Merged, not replaced: a caller passing its own `styles` would
      // otherwise drop the portal z-index and the `pointer-events: auto`
      // above, and the symptom — an unclickable menu inside the modal
      // drawer — surfaces far from the call that caused it. Per-key
      // overrides still win.
      styles: {
        ...defaultPortalingProps.styles,
        ...(isTableFilter ? tableFilterStyles : {}),
        ...props.styles,
      },
      unstyled: true,
      classNames,
      isDisabled: props.isDisabled || props.disabled,
      inputId: controlId,
      id: undefined,
      value: props.input ? props.input.value : props.value,
      onChange,
      onBlur,
    },
    menuIsOpen: props.menuIsOpen || isTableFilter,
    getOptionValue: props.getOptionValue || defaultGetOptionValue,
  };
};

export const useSelect = <
  T extends CustomSelectProps | CustomCreatableSelectProps,
>(
  props: T,
) => {
  const { defaults, overrides, menuIsOpen, getOptionValue } =
    useBaseSelectProps(props);
  const { value } = overrides;

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

  return { ...defaults, ...props, ...overrides, options };
};

export const useAsyncSelect = <
  T extends CustomAsyncSelectProps | CustomAsyncCreatableSelectProps,
>(
  props: T,
) => {
  const { defaults, overrides, menuIsOpen, getOptionValue } =
    useBaseSelectProps(props);
  const { value } = overrides;

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

  return {
    additional: { page: 1 },
    ...defaults,
    ...props,
    ...overrides,
    loadOptions,
  };
};
