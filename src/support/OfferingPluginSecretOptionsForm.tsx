import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { UserSecretOptionsForm } from '@waldur/marketplace/UserSecretOptionsForm';

export const OfferingPluginSecretOptionsForm: FunctionComponent<{}> = () => (
  <>
    <Form.Label className="mb-3">
      {translate('Confirmation notification template')}
    </Form.Label>
    <Field name="template_confirmation_comment" component={TextField} />

    <UserSecretOptionsForm />
  </>
);
