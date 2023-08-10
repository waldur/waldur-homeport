import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SecretField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ProviderForm = () => (
  <>
    <FormGroup label={translate('Label')} required={true}>
      <Field name="label" validate={required} component={StringField} />
    </FormGroup>
    <FormGroup
      label={translate('Client ID')}
      required={true}
      description={translate(
        'ID of application used for OAuth authentication.',
      )}
    >
      <Field name="client_id" validate={required} component={StringField} />
    </FormGroup>
    <FormGroup
      label={translate('Client secret')}
      required={true}
      description={translate('Application secret key.')}
    >
      <Field name="client_secret" validate={required} component={SecretField} />
    </FormGroup>
    <FormGroup
      label={translate('Discovery URL')}
      required={true}
      description={translate('The endpoint for endpoint discovery.')}
    >
      <Field name="discovery_url" validate={required} component={StringField} />
    </FormGroup>
    <FormGroup
      label={translate('Profile management URL')}
      description={translate('The endpoint for user details management.')}
    >
      <Field name="management_url" component={StringField} />
    </FormGroup>
    <Form.Group className="mb-7">
      <Field
        name="is_active"
        component={AwesomeCheckboxField}
        label={translate('Enabled')}
      />
    </Form.Group>
    <Form.Group className="mb-7">
      <Field
        name="verify_ssl"
        component={AwesomeCheckboxField}
        label={translate('Verify SSL')}
      />
    </Form.Group>
  </>
);
