import {
  CaretDownIcon,
  MagnifyingGlassIcon,
  XIcon,
} from '@phosphor-icons/react';
import { uniqueId } from 'lodash-es';
import {
  ClearIndicatorProps,
  components,
  ControlProps,
  DropdownIndicatorProps,
  MultiValueProps,
} from 'react-select';

import { Tag } from '../Tag';
import { Tooltip } from '../Tooltip';

// `classNamePrefix` used to add `metronic-select__input` to the real
// `<input>` element automatically; the Tailwind migration's `unstyled` +
// `classNames` config has no equivalent for it, since react-select's
// documented `inputClassName` prop turns out not to be wired to anything —
// `Select`'s `renderInput()` never forwards it into the props it passes to
// the `Input` component, so it's silently dropped. E2E locators
// (waldur-integration-testing's tests/components/select.py) still depend
// on this literal class to find the input, so it's added here by composing
// react-select's own `innerRef` callback (which is how it tracks the input
// for focus management) rather than wrapping the DOM in an extra element,
// which would break the grid-based single-value/placeholder overlay
// react-select relies on for this same input.
export const MetronicInput = (props: any) => {
  const composedRef = (node: HTMLInputElement | null) => {
    node?.classList.add('metronic-select__input');
    if (typeof props.innerRef === 'function') {
      props.innerRef(node);
    } else if (props.innerRef) {
      props.innerRef.current = node;
    }
  };
  return <components.Input {...props} innerRef={composedRef} />;
};

export const FilterSelectClearIndicator = (props: ClearIndicatorProps) => {
  return (
    <components.ClearIndicator {...props}>
      <XIcon size={16} weight="bold" />
    </components.ClearIndicator>
  );
};

export const SelectDropdownIndicator = (props: DropdownIndicatorProps) => (
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
        // `me-3`, not `ms-3 me-3`: the icon-to-border gap now comes from
        // `control`'s own `px-[11px]` in tailwindStyles.ts (that padding
        // has to apply unconditionally there, since this icon doesn't
        // always render — see the condition above and that comment), so
        // a left margin here would double it up again the same way
        // `control`'s own left padding once did. `me-3` still supplies the
        // icon-to-text gap — the old SCSS structure got that for free from
        // `.metronic-select__value-container`'s own left padding
        // (`calc($input-padding-x - 2px)` ≈ 10px), but this migration's
        // `valueContainer` classNames carry no padding of their own.
        // Confirmed live: the old deployment's icon-to-text gap measures
        // ~10px, matching `me-3` (0.75rem) at this app's 13px root font-size.
        className="text-gray-500 me-3"
      />
    )}
    {children}
  </components.Control>
);

export const MultiSelectOption = (props) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        // `border-[1px]`, not `border`: same Bootstrap `.border { ...
        // !important }` name collision as the select control (see
        // tailwindStyles.ts) — this checkbox's border-color was stuck on
        // Bootstrap's default instead of `--waldur-border-primary`.
        //
        // `appearance-none` is load-bearing, not decoration: without it the
        // browser renders its own native checkbox chrome, which ignores
        // author `border`/`border-radius`/`background` entirely — confirmed
        // live (the unchecked box measured `border-width: 0px`,
        // `appearance: auto` despite every one of those classes being
        // present). The old Bootstrap `.form-check-input` checkbox this
        // replaced sets `appearance: none` itself for the same reason, so
        // this has to draw its own checked-state fill and checkmark — reuses
        // `--checkbox-bg`, the same checkmark SVG data-URI the single-select
        // checkmark pseudo-element below already draws from `--root.scss`.
        // Colors and radius are pinned to what that old checkbox actually
        // measured live: brand-600 fill (not -500), 4px radius.
        className="appearance-none w-[16px] h-[16px] rounded-[4px] border-[1px] border-solid border-[var(--waldur-border-primary)] checked:bg-[var(--waldur-brand-600)] checked:border-[var(--waldur-brand-600)] checked:bg-no-repeat checked:bg-center checked:[background-image:var(--checkbox-bg)] flex-shrink-0 cursor-pointer"
        checked={props.isSelected}
        readOnly
      />
      <label className="ml-[8px] cursor-pointer">{props.label}</label>
    </components.Option>
  );
};
export const MultiSelectValue = (props: MultiValueProps) => (
  <Tag onClear={props.removeProps.onClick}>{props.children}</Tag>
);

export const MultiSelectLimitedValueContainer = (props) => {
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
        <Tooltip
          id={uniqueId('tip-multiselect')}
          label={hiddenValues.map((child) => child.props?.children).join(', ')}
        >
          <div className="inline-block">
            <Tag>+{hiddenValues.length}</Tag>
          </div>
        </Tooltip>
      )}

      {otherChildren}
    </components.ValueContainer>
  );
};
