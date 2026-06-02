import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';

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
