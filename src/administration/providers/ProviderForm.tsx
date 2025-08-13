import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { SecretField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ProviderForm = () => (
  <>
    <FormGroup label={translate('Label')} required={true}>
      <Field name="label" validate={required} component={StringField as any} />
    </FormGroup>
    <FormGroup
      label={translate('Client ID')}
      required={true}
      help={translate('ID of application used for OAuth authentication.')}
    >
      <Field
        name="client_id"
        validate={required}
        component={StringField as any}
      />
    </FormGroup>
    <FormGroup
      label={translate('Client secret')}
      required={true}
      help={translate('Application secret key.')}
    >
      <Field
        name="client_secret"
        validate={required}
        component={SecretField as any}
      />
    </FormGroup>
    <FormGroup
      label={translate('Discovery URL')}
      required={true}
      help={translate('The endpoint for endpoint discovery.')}
    >
      <Field
        name="discovery_url"
        validate={required}
        component={StringField as any}
      />
    </FormGroup>
    <FormGroup
      label={translate('Profile management URL')}
      help={translate('The endpoint for user details management.')}
    >
      <Field name="management_url" component={StringField as any} />
    </FormGroup>
    <FormGroup
      label={translate('Protected fields')}
      help={translate(
        'Enter a comma separated list of fields of the user profile that would be protected from editing in Waldur.',
      )}
    >
      <Field name="protected_fields" component={StringField as any} />
    </FormGroup>
    <FormGroup
      label={translate('Extra scope')}
      help={translate(
        'Space-separated list of scopes to request during authentication.',
      )}
    >
      <Field name="extra_scope" component={StringField as any} />
    </FormGroup>
    <FormGroup
      label={translate('User field')}
      help={translate('The field to be used for looking up the user.')}
    >
      <Field
        name="user_field"
        component={StringField as any}
        placeholder="username"
      />
    </FormGroup>
    <FormGroup
      label={translate('User claim')}
      help={translate(
        'Space seprated list of OIDC claims to be used as the value for the lookup field.',
      )}
    >
      <Field
        name="user_claim"
        component={StringField as any}
        placeholder="sub"
      />
    </FormGroup>
    <FormGroup
      label={translate('First name field')}
      help={translate(
        'The OIDC claim to be used as the value for the first name field.',
      )}
    >
      <Field
        name="attribute_mapping.first_name"
        component={StringField as any}
      />
    </FormGroup>
    <FormGroup
      label={translate('Last name field')}
      help={translate(
        'The OIDC claim to be used as the value for the last name field.',
      )}
    >
      <Field
        name="attribute_mapping.last_name"
        component={StringField as any}
      />
    </FormGroup>
    <FormGroup
      label={translate('Email field')}
      help={translate(
        'The OIDC claim to be used as the value for the email field.',
      )}
    >
      <Field name="attribute_mapping.email" component={StringField as any} />
    </FormGroup>
    <FormGroup
      label={translate('Affiliations field')}
      help={translate(
        'The OIDC claim to be used as the value for the affiliations field.',
      )}
    >
      <Field
        name="attribute_mapping.affiliations"
        component={StringField as any}
      />
    </FormGroup>
    <FormGroup
      label={translate('Civil number field')}
      help={translate(
        'The OIDC claim to be used as the value for the civil_number field.',
      )}
    >
      <Field
        name="attribute_mapping.civil_number"
        component={StringField as any}
      />
    </FormGroup>
    <Form.Group className="mb-7">
      <Field
        name="is_active"
        component={AwesomeCheckboxField as any}
        label={translate('Enabled')}
      />
    </Form.Group>
    <Form.Group className="mb-7">
      <Field
        name="verify_ssl"
        component={AwesomeCheckboxField as any}
        label={translate('Verify SSL')}
      />
    </Form.Group>
    <Form.Group className="mb-7">
      <Field
        name="enable_post_logout_redirect"
        component={AwesomeCheckboxField as any}
        label={translate('Enable post logout redirect')}
      />
    </Form.Group>
    <Form.Group className="mb-7">
      <Field
        name="enable_pkce"
        component={AwesomeCheckboxField as any}
        label={translate('Enable PKCE')}
      />
    </Form.Group>
  </>
);
