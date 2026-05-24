import {
  CaretDownIcon,
  MagnifyingGlassIcon,
  XIcon,
} from '@phosphor-icons/react';
import { uniqueId } from 'lodash-es';
import { FormCheck, OverlayTrigger, Popover } from 'react-bootstrap';
import {
  ClearIndicatorProps,
  components,
  ControlProps,
  DropdownIndicatorProps,
  MultiValueProps,
} from 'react-select';

import { Tag } from '@/core/Tag';

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
