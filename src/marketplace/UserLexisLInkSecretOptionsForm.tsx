import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { SecretField } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const UserLexisLinkSecretOptionsForm: FunctionComponent<{}> = () => {
  return (
    <>
      <Form.Label className="mt-3">{translate('HEAppE password')}</Form.Label>
      <Field name="heappe_password" component={SecretField} />

      <Form.Label className="mt-3">
        {translate('HEAppE cluster password')}
      </Form.Label>
      <Field name="heappe_cluster_password" component={SecretField} />
    </>
  );
};
