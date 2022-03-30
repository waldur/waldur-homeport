import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { FormGroup } from './FormGroup';

interface DisplayNameFieldProps {
  name: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export const DisplayNameField: FunctionComponent<DisplayNameFieldProps> = (
  props,
) => (
  <FormGroup
    label={translate('Display name')}
    required={true}
    description={translate('Label that is visible to users in Marketplace.')}
  >
    <Field
      component={Form.Control}
      name={props.name}
      type="text"
      validate={required}
      disabled={props.disabled}
      readOnly={props.readOnly}
    />
  </FormGroup>
);
