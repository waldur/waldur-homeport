import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';

import {
  composeValidators,
  email,
  getNameFieldValidators,
  required,
} from '@waldur/core/validators';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { DecoratedLabel } from '@waldur/rancher/template/DecoratedLabel';

export const CustomerCreateForm = () => {
  return (
    <>
      <Form.Group className="mb-7">
        <Form.Label>
          <DecoratedLabel label={translate('Name')} required />
        </Form.Label>
        <Field
          name="name"
          component={InputField as any}
          placeholder={translate('e.g. My Organization')}
          maxLength={150}
          validate={composeValidators(...getNameFieldValidators())}
        />
      </Form.Group>
      <Form.Group className="mb-7">
        <Form.Label>
          <DecoratedLabel label={translate('Contact email')} required />
        </Form.Label>
        <Field
          name="email"
          component={InputField as any}
          placeholder={translate('e.g.') + ' someone@example.com'}
          type="email"
          validate={composeValidators(required, email)}
        />
      </Form.Group>
    </>
  );
};
