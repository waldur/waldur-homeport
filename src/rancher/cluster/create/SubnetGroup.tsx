import * as React from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { SimpleSelectField } from './SimpleSelectField';

export const SubnetGroup = props => (
  <FormGroup
    label={translate('Subnet')}
    required={true}
    labelClassName={props.labelClassName}
    valueClassName={props.valueClassName}
  >
    <Field
      name="attributes.subnet"
      validate={required}
      options={props.options}
      component={SimpleSelectField}
    />
  </FormGroup>
);

SubnetGroup.defaultProps = {
  labelClassName: 'control-label col-sm-3',
  valueClassName: 'col-sm-9',
};
