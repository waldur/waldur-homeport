import { components, Props as SelectProps } from 'react-select';

import { Select } from '@/form/themed-select';

const MultiSelectLimitedValueContainer = (props) => {
  if (!props.hasValue) {
    return (
      <components.ValueContainer {...props}>
        {props.children}
      </components.ValueContainer>
    );
  }

  const [values, ...otherChildren] = props.children;

  return (
    <components.ValueContainer {...props}>
      {props.selectProps.placeholder} ({values.length}){otherChildren}
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
      classNames={{ menu: () => 'min-w-225px' }}
      {...props}
    />
  );
};
