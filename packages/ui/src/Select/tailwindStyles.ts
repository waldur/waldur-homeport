import { ClassNamesConfig, GroupBase } from 'react-select';

import { cn } from '../cn';

/**
 * Tailwind styling for react-select's `unstyled` mode, replacing the old
 * classNamePrefix + SCSS approach. Two recurring cascade gotchas show up
 * throughout this file, flagged inline only where they bite (the second
 * one no longer can, but explains why some values are written as they are):
 *
 * 1. react-select bakes a few properties (control `minHeight`, option
 *    `fontSize`/`display`) unconditionally, *outside* its own
 *    `unstyled ? {} : {...}` branches, as unlayered emotion CSS. Unlayered
 *    beats a normal-priority Tailwind utility regardless of source order,
 *    so those spots need the `!` important modifier.
 * 2. Legacy utilities used to generate `!important` rules under Tailwind's
 *    names (`border`, `shadow-sm`, `shadow-lg`), which beat Tailwind's
 *    despite its later layer, so this file spelled some values as
 *    arbitrary utilities (`shadow-[...]`).
 *
 * Values throughout are pinned to the legacy deployment via computed-style diffing,
 * not eyeballed.
 */
export interface SelectTailwindConfigOptions {
  size?: 'sm';
  variant?: 'tableFilter' | 'tableCell';
  hasError?: boolean;
}

export const getSelectTailwindClassNames = <
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  options: SelectTailwindConfigOptions = {},
): ClassNamesConfig<Option, IsMulti, Group> => {
  const { size, variant, hasError = false } = options;
  const isSm = size === 'sm';
  const isTableFilter = variant === 'tableFilter';
  // Shorter control for selects embedded in a table row, so they don't
  // blow out the row height (K8sSecurityRulesField.tsx's protocol/
  // direction columns).
  const isTableCell = variant === 'tableCell';

  return {
    // Only styling here: stylesheets, parents and tests find a part by the
    // `data-slot` slots.ts gives it.
    container: () => 'w-full text-sm relative',

    control: ({ isFocused, isDisabled }) => {
      return cn(
        // `font-normal`: a control must not inherit an ambient weight from its
        // host — `.card-header` sets `font-weight: 700`, which rendered the
        // value and placeholder bold in every card-toolbar select.
        'flex items-center justify-between w-full transition-colors font-normal',
        // 8px radius matches the old control's $border-radius (Tailwind's
        // `rounded-md` step is 6px).
        'rounded-lg border border-solid bg-[var(--input-bg)]',
        // Gotcha #1: `min-h-*!` overrides react-select's forced 38px.
        // Heights are the --control-height steps, like Input and Button
        // (bar the table-cell variant); `px-[11px]` doubles as the
        // search-icon-to-border gap for `isTableFilter` (FilterSelectControl's
        // icon only supplies the icon-to-text gap — see components.tsx).
        isTableCell
          ? 'min-h-[35px]! m-[1px] px-[11px] py-[6px] text-sm'
          : isSm
            ? 'min-h-[var(--control-height-sm)]! px-[8px] py-[1px] text-sm'
            : 'min-h-[var(--control-height-md)]! px-[11px] py-[5px] text-sm',
        // The default, hover, focus, invalid and disabled states are the
        // Input's (waldur-design-tokens/input.css).
        hasError
          ? isFocused
            ? 'border-[var(--input-invalid-border-focus)] [box-shadow:var(--input-invalid-focus-ring)]'
            : 'border-[var(--input-invalid-border)]'
          : isFocused
            ? 'border-[var(--input-border-focus)] [box-shadow:var(--input-focus-ring)]'
            : 'border-[var(--input-border)] hover:border-[var(--input-border-hover)]',
        // Flat disabled fill, not an opacity wash.
        isDisabled &&
          'border-[var(--input-disabled-border)] bg-[var(--input-disabled-bg)] cursor-not-allowed hover:border-[var(--input-disabled-border)]',
        // react-select ignores a disabled <fieldset> (a locked wizard step),
        // so it takes the same disabled look from there.
        'in-[fieldset:disabled]:border-[var(--input-disabled-border)] in-[fieldset:disabled]:bg-[var(--input-disabled-bg)] in-[fieldset:disabled]:cursor-not-allowed',
      );
    },

    valueContainer: ({ isMulti }) =>
      cn(
        'flex flex-1 items-center gap-[6px]',
        // A multi-select collapses everything past the second value into a
        // `+N` tag, so wrapping only ever bought a second line that made the
        // control change height as values came and went. Without wrapping the
        // 2px band that separated those lines has nothing to space, and it
        // pushed a 24px tag past the 26px the control holds inside its own
        // padding — growing the control by 2px the moment a value was picked.
        isMulti ? 'flex-nowrap' : 'flex-wrap',
      ),

    multiValue: () =>
      'bg-quaternary rounded-md px-[4px] py-[2px] flex items-center gap-[4px]',

    multiValueLabel: () => 'text-[11px] text-primary',

    multiValueRemove: () =>
      // eslint-disable-next-line waldur-custom/no-raw-status-ramp -- a hover tint one step stronger than -bg (error-100), so it reads on the chip
      'hover:bg-error-100 dark:hover:bg-error-900 hover:text-danger rounded-sm px-[2px] cursor-pointer transition-colors',

    singleValue: ({ isDisabled }) =>
      cn('text-primary leading-normal truncate', isDisabled && 'text-quinary'),

    placeholder: ({ isDisabled }) =>
      cn(
        'truncate select-none',
        // `--text-quaternary`, not `--text-quinary`: the
        // select's placeholder and an input's
        // `::placeholder` render in the same color; `-muted` is a step
        // lighter and only matches elsewhere by coincidence.
        isDisabled ? 'text-[var(--text-disabled)]' : 'text-quaternary',
      ),

    input: () => 'text-primary m-0 p-0 text-[inherit]',

    indicatorsContainer: () => 'flex items-center gap-[4px] self-stretch',

    indicatorSeparator: () => 'hidden',

    dropdownIndicator: ({ selectProps: { menuIsOpen } }) =>
      cn(
        'text-quinary hover:text-quaternary transition-transform duration-200 p-[2px]',
        menuIsOpen && 'rotate-180',
        isTableFilter && 'hidden',
      ),

    clearIndicator: () =>
      cn(
        'text-quinary hover:text-danger cursor-pointer transition-colors',
        // Filter panels hide the dropdown arrow above, so the clear
        // button needs its own breathing room instead of sharing the
        // indicators gap.
        isTableFilter ? 'pr-[8px] mr-[8px]' : 'p-[2px]',
      ),

    menu: () =>
      cn(
        // --listbox-shadow keeps the old menu's own values: a 1px outline
        // plus a soft 4px/11px drop, the same in both themes.
        'z-[9999] overflow-hidden bg-primary',
        // `--bg-primary` matches the control's background in both themes.
        // A table filter's menu sits flat inside its panel, as before the
        // Tailwind migration: no outline, shadow, gap or rounded corners.
        !isTableFilter &&
          'mt-[8px] rounded-lg border border-solid border-secondary shadow-[var(--listbox-shadow)]',
      ),

    menuList: () =>
      cn(
        // No `py-*`: the menu already clips to its own rounded corners
        // (`overflow-hidden` above), so an unpadded list lets the first/
        // last row's hover fill go flush to the border instead of
        // leaving a gap of bare menu background.
        'overflow-y-auto max-h-[260px]',
      ),

    option: ({ isFocused, isSelected, isDisabled, isMulti }) => {
      const colorClasses = cn(
        isSelected
          ? 'bg-primary-hover text-primary'
          : isFocused
            ? 'bg-primary-hover text-primary'
            : 'text-primary',
        isDisabled && 'opacity-40 cursor-not-allowed text-quinary',
      );

      // `flex!`/`text-[…]!` are gotcha #1: react-select's Option forces
      // `display: block` and `fontSize: inherit` unconditionally.
      // `justify-between` only for single-select: it pushes the row's
      // content away from the selected row's check (SelectOption's
      // `[data-select-check]`) on the far right. Multi-select renders two
      // real children (checkbox, label) that `justify-between` would shove
      // apart instead of keeping together — the old SCSS scoped this the
      // same way, to single-select menus only.
      // The `grow` rule (also single-select only, as in the old SCSS) lets
      // a custom Option's content fill the row, so anything it right-aligns
      // (RoleOption's type badge, UserListOptionInline's icons) stays at the
      // far edge instead of collapsing onto the label; it and the table
      // filter's `line-clamp-2` skip the check, which keeps its own size.
      if (isTableFilter) {
        return cn(
          'flex! items-center gap-[8px] h-[40px] px-[12px] py-[2px]',
          !isMulti
            ? 'justify-between [&>*:not([data-select-check])]:grow [&>*:not([data-select-check])]:line-clamp-2'
            : '[&>label]:line-clamp-2',
          'cursor-pointer select-none transition-colors text-sm!',
          colorClasses,
        );
      }

      return cn(
        'flex! items-center gap-[8px] px-[16px] py-[10px] cursor-pointer select-none transition-colors text-sm!',
        // `gap-[8px]` keeps the content clear of the selected row's check.
        !isMulti && 'justify-between [&>*:not([data-select-check])]:grow',
        colorClasses,
      );
    },

    group: () => 'pt-[6px] pb-[2px]',
    groupHeading: () =>
      'px-[12px] py-[4px] text-[11px] font-semibold uppercase tracking-wider text-quinary',

    noOptionsMessage: () => 'p-[12px] text-center text-sm text-quinary',
    loadingMessage: () => 'p-[12px] text-center text-sm text-quinary',
  };
};
