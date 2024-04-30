import { FC } from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { NodeRoleField } from './NodeRoleField';

export const NodeRoleGroup: FC = () => (
  <FormGroup label={translate('Role')} required={true}>
    <Field name="roles" component={NodeRoleField} validate={required} />
  </FormGroup>
);
