import { ClassNamesConfig, GroupBase } from 'react-select';

import { cn } from '../cn';

/**
 * Tailwind styling for react-select's `unstyled` mode, replacing the old
 * classNamePrefix + SCSS approach. Two recurring cascade gotchas show up
 * throughout this file, flagged inline only where they bite:
 *
 * 1. react-select bakes a few properties (control `minHeight`, option
 *    `fontSize`/`display`) unconditionally, *outside* its own
 *    `unstyled ? {} : {...}` branches, as unlayered emotion CSS. Unlayered
 *    beats a normal-priority Tailwind utility regardless of source order,
 *    so those spots need the `!` important modifier.
 * 2. Bootstrap 5 generates `!important` on every utility by default, so a
 *    Tailwind utility that happens to share Bootstrap's literal class name
 *    (`border`, `shadow-sm`, `shadow-lg`) loses even though Tailwind's
 *    `utilities` layer normally outranks `bootstrap`: cascade layers order
 *    `!important` declarations in reverse (see src/tailwind.css's own
 *    `.collapse` comment). Spelling the same value as an arbitrary utility
 *    (`border-[1px]`, `shadow-[...]`) sidesteps the name collision.
 *
 * Values throughout are pinned to the live pre-migration (Bootstrap/SCSS)
 * deployment via computed-style diffing, not eyeballed.
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
    // `metronic-select-container`/`metronic-select__*` literal classes are
    // kept everywhere in this file alongside the Tailwind utilities:
    // LocalLogin.css, VStepperFormStep.scss, SavedFilterSelect.scss and
    // the E2E test helpers (waldur-integration-testing's
    // tests/components/select.py) all still hook into these names
    // directly, the same way `classNamePrefix` used to let them.
    container: () => 'metronic-select-container w-full text-[13px] relative',

    control: ({ isFocused, isDisabled }) => {
      const stateClasses = cn(
        'metronic-select__control',
        isFocused && 'metronic-select__control--is-focused',
        isDisabled && 'metronic-select__control--is-disabled',
      );
      return cn(
        stateClasses,
        'flex items-center justify-between w-full transition-colors',
        // Gotcha #2: bare `border`/`rounded-md` would collide with
        // Bootstrap. 8px radius matches the old control's $border-radius
        // (Tailwind's `rounded-md` step is 6px).
        'rounded-[8px] border-[1px] border-solid bg-[var(--waldur-bg-primary)]',
        // Gotcha #1: `min-h-*!` overrides react-select's forced 38px.
        // Heights below match the old control's measured height per
        // variant; `px-[11px]` doubles as the search-icon-to-border gap
        // for `isTableFilter` (FilterSelectControl's icon only supplies
        // the icon-to-text gap, not icon-to-border — see components.tsx).
        isTableCell
          ? 'min-h-[35px]! m-[1px] px-[11px] py-[6px] text-[14.3px]'
          : isSm
            ? 'min-h-[28px]! px-[8px] py-[4.5px] text-[14px]'
            : 'min-h-[40px]! px-[11px] py-[6px] text-[14.3px]',
        hasError
          ? 'border-[var(--color-border-danger)] ring-1 ring-[var(--color-border-danger)]'
          : isFocused
            ? // brand-300 (light) / brand-400 (dark): the old focus color
              // ($border-brand) picks a different rung of the brand ramp
              // per theme, since the ramp itself doesn't re-theme at
              // runtime. No `shadow-sm` — the old focused control has
              // exactly one box-shadow layer (this ring), and the name
              // collides with Bootstrap's own `.shadow-sm` per gotcha #2.
              'border-[var(--waldur-brand-300)] dark:border-[var(--waldur-brand-400)] ring-1 ring-[var(--waldur-brand-300)] dark:ring-[var(--waldur-brand-400)]'
            : 'border-[var(--color-border-secondary)] hover:border-[var(--waldur-brand-500)]',
        // Flat disabled fill, not an opacity wash: matches the old
        // $input-disabled-bg, which dimmed only the placeholder text.
        isDisabled &&
          'bg-[var(--waldur-bg-disabled-subtle)] cursor-not-allowed',
      );
    },

    valueContainer: ({ isMulti }) =>
      cn('flex flex-1 items-center flex-wrap gap-[6px]', isMulti && 'py-[2px]'),

    multiValue: () =>
      'bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-700)] rounded-md px-[4px] py-[2px] flex items-center gap-[4px] m-[2px]',

    multiValueLabel: () => 'text-[11px] text-[var(--surface-text-primary)]',

    multiValueRemove: () =>
      'hover:bg-[var(--color-error-100)] dark:hover:bg-[var(--color-error-900)] hover:text-[var(--color-error-600)] rounded-[4px] px-[2px] cursor-pointer transition-colors',

    singleValue: ({ isDisabled }) =>
      cn(
        // Literal class, same reasoning as `container`/`control`/etc above:
        // E2E tests (tests/pages/resources/vmware_vm/order.py and others)
        // assert against `.metronic-select__single-value` directly to read
        // back a single-select's displayed value.
        'metronic-select__single-value',
        'text-[var(--surface-text-primary)] leading-normal truncate',
        isDisabled && 'text-[var(--surface-text-muted)]',
      ),

    placeholder: ({ isDisabled }) =>
      cn(
        'truncate select-none',
        // `--surface-text-secondary`, not `--surface-text-muted`: the old
        // select's placeholder and a plain Bootstrap `.form-control`'s
        // `::placeholder` render in the same color; `-muted` is a step
        // lighter and only matches elsewhere by coincidence.
        isDisabled
          ? 'text-[var(--waldur-text-disabled)]'
          : 'text-[var(--surface-text-secondary)]',
      ),

    input: () => 'text-[var(--surface-text-primary)] m-0 p-0 text-[inherit]',

    indicatorsContainer: () => 'flex items-center gap-[4px] self-stretch',

    indicatorSeparator: () => 'hidden',

    dropdownIndicator: ({ selectProps: { menuIsOpen } }) =>
      cn(
        'text-[var(--surface-text-muted)] hover:text-[var(--surface-text-secondary)] transition-transform duration-200 p-[2px]',
        menuIsOpen && 'rotate-180',
        isTableFilter && 'hidden',
      ),

    clearIndicator: () =>
      cn(
        'metronic-select__clear-indicator text-[var(--surface-text-muted)] hover:text-[var(--color-error-600)] cursor-pointer transition-colors',
        // Filter panels hide the dropdown arrow above, so the clear
        // button needs its own breathing room instead of sharing the
        // indicators gap.
        isTableFilter ? 'pr-[8px] mr-[8px]' : 'p-[2px]',
      ),

    menu: () =>
      cn(
        'metronic-select__menu',
        // Gotcha #2 again for `border`/`shadow-lg`. Radius and shadow
        // match the old menu's own values (a 1px outline plus a soft
        // 4px/11px drop shadow — the old menu has no real `border-width`
        // either, just this shadow).
        'z-[9999] mt-[8px] overflow-hidden rounded-[8px] border-[1px] border-solid border-[var(--surface-card-border)]',
        // `--waldur-bg-primary`, not `--surface-card-bg`: the old menu
        // always matches its own control's background exactly. The two
        // tokens only coincide in light mode — in dark mode
        // `--surface-card-bg` is a step lighter, seaming visibly against
        // the control it drops from.
        'bg-[var(--waldur-bg-primary)] shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_11px_0_rgba(0,0,0,0.1)]',
      ),

    menuList: ({ isMulti }) =>
      cn(
        'metronic-select__menu-list',
        isMulti && 'metronic-select__menu-list--is-multi',
        // No `py-*`: the menu already clips to its own rounded corners
        // (`overflow-hidden` above), so an unpadded list lets the first/
        // last row's hover fill go flush to the border instead of
        // leaving a gap of bare menu background.
        'overflow-y-auto max-h-[260px]',
      ),

    option: ({ isFocused, isSelected, isDisabled, isMulti }) => {
      const stateClasses = cn(
        'metronic-select__option',
        isSelected && 'metronic-select__option--is-selected',
        isFocused && 'metronic-select__option--is-focused',
        isDisabled && 'metronic-select__option--is-disabled',
      );

      // Single-select's selected row gets the same checkmark the old
      // SCSS drew via the app's shared `--checkbox-bg` custom property
      // (a complete `url(...)`, see _root.scss). Multi-select skips it —
      // MultiSelectOption already renders its own checkbox.
      const checkmarkClasses =
        !isMulti &&
        isSelected &&
        cn(
          "after:content-[''] after:block after:shrink-0",
          'after:w-[16px] after:h-[16px] after:scale-125',
          'after:bg-no-repeat after:bg-center after:[background-image:var(--checkbox-bg)]',
        );

      const colorClasses = cn(
        isSelected
          ? 'bg-[var(--surface-hover-bg)] font-medium text-[var(--surface-text-primary)]'
          : isFocused
            ? 'bg-[var(--surface-hover-bg)] text-[var(--surface-text-primary)]'
            : 'text-[var(--surface-text-primary)]',
        isDisabled &&
          'opacity-40 cursor-not-allowed text-[var(--surface-text-muted)]',
      );

      // `flex!`/`text-[…]!` are gotcha #1: react-select's Option forces
      // `display: block` and `fontSize: inherit` unconditionally.
      // `justify-between` only for single-select: it pushes the row's
      // one real child away from the `::after` checkmark on the far
      // right (a pseudo-element counts as a flex item). Multi-select
      // renders two real children (checkbox, label) that `justify-
      // between` would shove apart instead of keeping together — the
      // old SCSS scoped this the same way, to
      // `:not(.metronic-select__menu-list--is-multi)` only.
      if (isTableFilter) {
        return cn(
          stateClasses,
          'flex! items-center gap-[8px] h-[40px] px-[12px] py-[2px]',
          !isMulti && 'justify-between',
          'cursor-pointer select-none transition-colors text-[14px]!',
          '[&>*]:line-clamp-2',
          checkmarkClasses,
          colorClasses,
        );
      }

      return cn(
        stateClasses,
        'flex! items-center px-[16px] py-[10px] cursor-pointer select-none transition-colors text-[14.3px]!',
        !isMulti && 'justify-between',
        checkmarkClasses,
        colorClasses,
      );
    },

    group: () => 'pt-[6px] pb-[2px]',
    groupHeading: () =>
      'px-[12px] py-[4px] text-[11px] font-semibold uppercase tracking-wider text-[var(--surface-text-muted)]',

    noOptionsMessage: () =>
      'p-[12px] text-center text-[13px] text-[var(--surface-text-muted)]',
    loadingMessage: () =>
      'p-[12px] text-center text-[13px] text-[var(--surface-text-muted)]',
  };
};
