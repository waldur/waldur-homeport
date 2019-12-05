import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

const SubnetField = props => (
  <Select
    value={props.input.value}
    onChange={props.input.onChange}
    options={props.options}
    simpleValue={true}
  />
);

export const SubnetGroup = props => (
  <FormGroup
    label={translate('Subnet')}
    required={true}
    labelClassName="control-label col-sm-3"
    valueClassName="col-sm-9"
  >
    <Field
      name="attributes.subnet"
      validate={required}
      options={props.options}
      component={SubnetField}
    />
  </FormGroup>
);
