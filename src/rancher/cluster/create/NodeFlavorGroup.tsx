import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup } from '@/form';
import { Select } from '@/form/select';
import { translate } from '@/i18n';

const SelectFlavorField: FC<any> = (props) => (
  <Select
    value={props.input.value}
    onChange={props.input.onChange}
    options={props.options}
    isClearable={true}
    instanceId="flavor"
  />
);

interface NodeFlavorGroupProps {
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
      />
    </FormGroup>
  );
};
