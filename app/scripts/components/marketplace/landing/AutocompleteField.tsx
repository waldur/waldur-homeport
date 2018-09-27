import * as React from 'react';
import { Async, Option } from 'react-select';

import { optionRenderer } from '@waldur/form-react/optionRenderer';

const renderer = optionRenderer({
  iconKey: 'thumbnail',
  labelKey: option => `${option.category_title} / ${option.name}`,
  imgStyle: {width: 19},
});

interface AutocompleteFieldProps {
  placeholder: string;
  loadOfferings: (query: string) => Option;
  onChange: (offeringId: string) => void;
  value?: any;
}

export const AutocompleteField = (props: AutocompleteFieldProps) => (
  <Async
    placeholder={props.placeholder}
    loadOptions={props.loadOfferings}
    valueKey="uuid"
    labelKey="name"
    optionRenderer={renderer}
    valueRenderer={renderer}
    value={props.value}
    onChange={(value: any) => props.onChange(value)}
  />
);
