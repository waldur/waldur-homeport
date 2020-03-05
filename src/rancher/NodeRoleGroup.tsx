import * as React from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { NodeRoleField } from './NodeRoleField';

export const NodeRoleGroup = props => (
  <FormGroup
    label={translate('Role')}
    required={true}
    labelClassName={props.labelClassName}
    valueClassName={props.valueClassName}
  >
    <Field name="roles" component={NodeRoleField} validate={required} />
  </FormGroup>
);
