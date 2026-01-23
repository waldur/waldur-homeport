import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { components, MultiValueGenericProps } from 'react-select';
import { customersCountriesList } from 'waldur-js-client';

import { CountryFlag } from '@waldur/marketplace/common/CountryFlag';

import { WindowedSelect } from './themed-select';
import { FormField } from './types';

interface CountryOption {
  label: string;
  value: string;
}

const CountryRenderer = ({ value, label }: CountryOption) => (
  <span>
    <CountryFlag countryCode={value} fontSize={20} /> {label}
  </span>
);

const Option: FC<any> = (props) => (
  <components.Option {...props}>
    <CountryRenderer {...props.data} />
  </components.Option>
);

const MultiValueLabel: FC<MultiValueGenericProps<CountryOption>> = (props) => (
  <components.MultiValueLabel {...props}>
    <CountryRenderer {...props.data} />
  </components.MultiValueLabel>
);

interface MultiCountrySelectFieldProps extends FormField {
  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
}

export const MultiCountrySelectField: FC<MultiCountrySelectFieldProps> = ({
  input,
  placeholder,
  isClearable = true,
  isDisabled = false,
}) => {
  const { isLoading, data } = useQuery({
    queryKey: ['countries'],
    queryFn: () => customersCountriesList().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  // Convert string array to options array
  const selectedOptions = Array.isArray(input.value)
    ? data?.filter((option) => input.value.includes(option.value)) || []
    : [];

  return (
    <WindowedSelect
      value={selectedOptions}
      onChange={(options: readonly CountryOption[] | null) => {
        const values = options ? options.map((o) => o.value) : [];
        input.onChange(values);
        input.onBlur(values);
      }}
      onBlur={() => input.onBlur(input.value)}
      components={{ Option, MultiValueLabel }}
      placeholder={placeholder}
      getOptionLabel={(option: CountryOption) => option.label}
      getOptionValue={(option: CountryOption) => option.value}
      options={data || []}
      isLoading={isLoading}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isMulti
      className="metronic-select-container"
      classNamePrefix="metronic-select"
    />
  );
};
