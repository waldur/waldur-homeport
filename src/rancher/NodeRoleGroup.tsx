import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { NodeRoleField } from './NodeRoleField';

export const NodeRoleGroup = () => (
  <FormGroup
    label={translate('Role')}
    required={true}>
    <Field
      name="roles"
      component={NodeRoleField}
    />
  </FormGroup>
);
