import { FunctionComponent } from 'react';
import { components } from 'react-select';

import { AsyncPaginate } from '@waldur/form/themed-select';

const renderIcon = (src: string, imgStyle: any) => (
  <img
    src={src}
    style={{
      display: 'inline-block',
      marginRight: 10,
      position: 'relative',
      top: -2,
      verticalAlign: 'middle',
      ...imgStyle,
    }}
  />
);

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

export const AutocompleteField: FunctionComponent<AutocompleteFieldProps> = (
  props,
) => (
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
