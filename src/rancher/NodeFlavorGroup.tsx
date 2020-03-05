import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

const SelectFlavorField = props => (
  <Select
    value={props.input.value}
    onChange={props.input.onChange}
    options={props.options}
  />
);

export const NodeFlavorGroup = props => (
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
  </FormGroup>
);
