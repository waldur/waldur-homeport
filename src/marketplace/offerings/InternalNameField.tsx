import * as React from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { FormGroup } from './FormGroup';

interface InternalNameFieldProps {
  name: string;
}

export const InternalNameField = (props: InternalNameFieldProps) => (
  <FormGroup
    label={translate('Internal name')}
    required={true}
    description={translate('Technical name intended for integration and automated reporting. Please use Latin letters without spaces only.')}>
    <Field
      component="input"
      className="form-control"
      name={props.name}
      type="text"
      validate={required}
      parse={v => v.replace('.', '')}
    />
  </FormGroup>
);
