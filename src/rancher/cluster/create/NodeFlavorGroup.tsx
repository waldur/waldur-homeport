import * as React from 'react';
import Select, { Option } from 'react-select';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { LonghornWorkerWarning } from './LonghornWorkerWarning';

const SelectFlavorField = (props) => (
  <Select
    value={props.input.value}
    onChange={props.input.onChange}
    options={props.options}
  />
);

interface NodeFlavorGroupProps {
  labelClassName?: string;
  valueClassName?: string;
  nodeIndex?: number;
  options: Option[];
}

export const NodeFlavorGroup: React.FC<NodeFlavorGroupProps> = (props) => {
  return (
    <FormGroup
      label={translate('Flavor')}
      required={true}
      labelClassName={props.labelClassName}
      valueClassName={props.valueClassName}
    >
      <Field
        name="flavor"
        component={SelectFlavorField}
        options={props.options}
        validate={required}
      />
      <LonghornWorkerWarning nodeIndex={props.nodeIndex} />
    </FormGroup>
  );
};
