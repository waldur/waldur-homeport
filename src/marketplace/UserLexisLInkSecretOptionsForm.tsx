import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field, formValueSelector } from 'redux-form';

import { SecretField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { EDIT_LEXIS_LINK_INTEGRATION_FORM_ID } from './offerings/update/integration/constants';

export const secretOptionsSelector = (state: RootState) =>
  formValueSelector(EDIT_LEXIS_LINK_INTEGRATION_FORM_ID)(
    state,
    'secret_options',
  );

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
