import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field, formValueSelector } from 'redux-form';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { EDIT_LEXIS_LINK_INTEGRATION_FORM_ID } from './offerings/update/integration/constants';

export const pluginOptionsSelector = (state: RootState) =>
  formValueSelector(EDIT_LEXIS_LINK_INTEGRATION_FORM_ID)(
    state,
    'plugin_options',
  );

export const UserLexisLinkPluginOptionsForm: FunctionComponent<{}> = () => {
  return (
    <>
      <Form.Label className="mt-3">{translate('HEAppE URL')}</Form.Label>
      <Field name="heappe_url" component={StringField} />

      <Form.Label className="mt-3">{translate('HEAppE username')}</Form.Label>
      <Field name="heappe_username" component={StringField} />

      <Form.Label className="mt-3">{translate('HEAppE cluster ID')}</Form.Label>
      <Field name="heappe_cluster_id" component={StringField} />

      <Form.Label className="mt-3">
        {translate('HEAppE local base path')}
      </Form.Label>
      <Field name="heappe_local_base_path" component={StringField} />
    </>
  );
};
