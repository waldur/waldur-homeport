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
  OptionProps,
} from 'react-select';

import { Checkbox } from '../Check';
import { CheckMark } from '../Check/CheckMark';
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

/**
 * react-select's Option plus, on a single-select's selected row, a check at
 * the end. The default Option of every single-select (see composeComponents);
 * a custom Option keeps the check by rendering this instead of react-select's
 * `components.Option`. Multi-select rows show a Checkbox instead.
 */
export const SelectOption = ({ children, ...props }: OptionProps<any, any>) => (
  <components.Option {...props}>
    {children}
    {!props.isMulti && props.isSelected && (
      <CheckMark
        data-select-check=""
        className="w-[12px] shrink-0 grow-0 text-[var(--waldur-brand-600)]"
      />
    )}
  </components.Option>
);

export const MultiSelectOption = (props) => {
  return (
    <components.Option {...props}>
      {/* A visual only: react-select's option is the control. Same box as
          every other checkbox (16px, brand-600 fill, 4px radius). */}
      <Checkbox
        size="sm"
        checked={props.isSelected}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
      />
      <label className="cursor-pointer">{props.label}</label>
    </components.Option>
  );
};
export const MultiSelectValue = (props: MultiValueProps) => (
  // `.tag` is a flex row, so a bare text child wraps onto a second line and
  // doubles the control's height in a narrow select. Truncate it instead; the
  // values past the limit already collapse into a `+N` tag with a tooltip.
  <Tag onClear={props.removeProps.onClick} className="max-w-full">
    <span className="truncate">{props.children}</span>
  </Tag>
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
