import { FC } from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { SimpleSelectField } from './SimpleSelectField';

export const SubnetGroup: FC<{ options }> = ({ options }) => (
  <FormGroup label={translate('Subnet')} required={true}>
    <Field
      name="attributes.subnet"
      validate={required}
      options={options}
      component={SimpleSelectField}
    />
  </FormGroup>
);
