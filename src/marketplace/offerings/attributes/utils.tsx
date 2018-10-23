import * as React from 'react';
import Select from 'react-select';

import { parseIntField, formatIntField } from '@waldur/marketplace/common/utils';

import { CustomRadioButton } from './CustomRadioButton';

export interface AttrConfig {
  type?: string;
  min?: number;
  parse?: any;
  format?: any;
  component?: any;
  normalize?: (v: string) => string;
  checked?: boolean;
  rows?: number;
}

export const configAttrField = attribute => {
  let attr: AttrConfig = {};
  switch (attribute.type) {
    case 'integer':
      attr = {
        type: 'number',
        min: 0,
        parse: parseIntField,
        format: formatIntField,
      };
      break;
    case 'text':
      attr = {
        component: 'textarea',
        rows: 7,
      };
      break;
    case 'list':
      attr = {
        component: componentProp => (
          <Select
            value={componentProp.input.value}
            onChange={value => componentProp.input.onChange(value)}
            options={attribute.options}
            valueKey="key"
            labelKey="title"
            multi={true}
          />
        ),
        normalize: v => v ? v : '',
      };
      break;
    case 'choice':
      attr = {
        component: componentProp => (
          <Select
            value={componentProp.input.value}
            onChange={value => componentProp.input.onChange(value)}
            options={attribute.options}
            valueKey="key"
            labelKey="title"
            simpleValue={true}
          />
        ),
        normalize: v => v ? v : '',
      };
      break;
    case 'boolean':
      attr = {
        component: componentProp => {
          const choices = [
            {value: '', label: 'All'},
            {value: 'true', label: 'Yes'},
            {value: 'false', label: 'No'},
          ];
          return (
            <CustomRadioButton
              choices={choices}
              name={attribute.key}
              input={componentProp.input}/>
          );
        },
      };
      break;
    default:
      attr = {
        type: 'text',
      };
  }
  return attr;
};
