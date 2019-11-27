import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

const SelectSubnetField = props => (
  <Select
    value={props.input.value}
    onChange={props.input.onChange}
    options={props.options}
    simpleValue={true}
  />
);

export const NodeSubnetGroup = props => (
  <FormGroup
    label={translate('Subnet')}
    required={true}>
    <Field
      name="subnet"
      component={SelectSubnetField}
      options={props.subnetChoices}
      required={true}
    />
  </FormGroup>
);
