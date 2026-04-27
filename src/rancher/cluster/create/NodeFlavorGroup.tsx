import { FC } from 'react';
import { Field } from 'redux-form';

import { required } from '@/core/validators';
import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

const SelectFlavorField: FC<any> = (props) => (
  <Select
    value={props.input.value}
    onChange={props.input.onChange}
    options={props.options}
    isClearable={true}
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
        isClearable={true}
      />
    </FormGroup>
  );
};
