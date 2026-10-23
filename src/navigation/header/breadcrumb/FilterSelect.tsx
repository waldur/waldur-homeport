import { components, Props as SelectProps } from 'react-select';

import { Select } from '@/form/select';

const MultiSelectLimitedValueContainer = (props) => {
  // One shape with and without a value, so the input keeps its child slot and
  // is not remounted on the first pick; see waldur-ui's
  // MultiSelectLimitedValueContainer.
  const [values, ...otherChildren] = props.children;

  return (
    <components.ValueContainer {...props}>
      {props.hasValue ? (
        <>
          {props.selectProps.placeholder} ({values.length})
        </>
      ) : (
        values
      )}
      {otherChildren}
    </components.ValueContainer>
  );
};

interface FilterSelectProps extends SelectProps {
  input: { value; onChange };
}

export const FilterSelect = (props: FilterSelectProps) => {
  return (
    <Select
      value={props.input.value}
      onChange={(value) => props.input.onChange(value)}
      options={props.options}
      placeholder={props.placeholder}
      isMulti
      isClearable={false}
      size="sm"
      components={{ ValueContainer: MultiSelectLimitedValueContainer }}
      classNames={{ menu: () => 'min-w-[225px]' }}
      {...props}
    />
  );
};
