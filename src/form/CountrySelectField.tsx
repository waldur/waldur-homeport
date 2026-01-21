import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { components } from 'react-select';
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

const SingleValue: FC<any> = (props) => (
  <components.SingleValue {...props}>
    <CountryRenderer {...props.data} />
  </components.SingleValue>
);

interface CountrySelectFieldProps extends FormField {
  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
}

export const CountrySelectField: FC<CountrySelectFieldProps> = ({
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

  return (
    <WindowedSelect
      value={
        input.value
          ? data?.find((option) => option.value === input.value) || null
          : null
      }
      onChange={(option: CountryOption | null) => {
        input.onChange(option?.value || null);
        input.onBlur(option?.value || null);
      }}
      onBlur={() => input.onBlur(input.value)}
      components={{ Option, SingleValue }}
      placeholder={placeholder}
      getOptionLabel={(option: CountryOption) => option.label}
      getOptionValue={(option: CountryOption) => option.value}
      options={data || []}
      isLoading={isLoading}
      isClearable={isClearable}
      isDisabled={isDisabled}
      className="metronic-select-container"
      classNamePrefix="metronic-select"
    />
  );
};
