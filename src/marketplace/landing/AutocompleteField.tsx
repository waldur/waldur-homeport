import * as React from 'react';
import { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';

import { renderIcon } from '@waldur/form/optionRenderer';

const Option = (props) => {
  const img = renderIcon(props.data.thumbnail, { width: 19 });
  return (
    <components.Option {...props}>
      {img}
      {`${props.data.category_title} / ${props.data.name}`}
    </components.Option>
  );
};

const SingleValue = (props) => {
  const img = renderIcon(props.data.thumbnail, { width: 19 });
  return (
    <components.SingleValue {...props}>
      {img}
      {props.children}
    </components.SingleValue>
  );
};

interface AutocompleteFieldProps {
  placeholder: string;
  loadOfferings: (
    query: string,
    prevOptions,
    additional: { page: number },
  ) => any;
  onChange: (offeringId: string) => void;
  value?: any;
  noOptionsMessage?: (message) => string;
}

export const AutocompleteField = (props: AutocompleteFieldProps) => (
  <AsyncPaginate
    placeholder={props.placeholder}
    loadOptions={props.loadOfferings}
    components={{ Option, SingleValue }}
    defaultOptions
    getOptionValue={(option) => option.uuid}
    getOptionLabel={(option) => `${option.category_title} / ${option.name}`}
    value={props.value}
    onChange={(value: any) => props.onChange(value)}
    noOptionsMessage={props.noOptionsMessage}
    isClearable={true}
    additional={{
      page: 1,
    }}
  />
);
