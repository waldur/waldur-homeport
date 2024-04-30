import { FC } from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SelectControl } from '@waldur/form/SelectControl';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { LonghornWorkerWarning } from './LonghornWorkerWarning';

const SelectFlavorField: FC<any> = (props) => (
  <SelectControl
    value={props.input.value}
    onChange={props.input.onChange}
    options={props.options}
    isClearable={true}
  />
);

interface NodeFlavorGroupProps {
  nodeIndex?: number;
  options: any[];
}

export const NodeFlavorGroup: FC<NodeFlavorGroupProps> = (props) => {
  return (
    <FormGroup label={translate('Flavor')} required={true}>
      <Field
        name="flavor"
        component={SelectFlavorField}
        options={props.options}
        validate={required}
        isClearable={true}
      />
      {typeof props.nodeIndex === 'number' ? (
        <LonghornWorkerWarning nodeIndex={props.nodeIndex} />
      ) : null}
    </FormGroup>
  );
};
