import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';

import { NodeRoleField } from './NodeRoleField';

export const NodeRoleGroup: FC = () => (
  <FormGroup label={translate('Role')} required={true}>
    <Field name="role" component={NodeRoleField} validate={required} />
  </FormGroup>
);
