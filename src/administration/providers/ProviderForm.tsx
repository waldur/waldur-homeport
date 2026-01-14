import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';

import {
  required,
  redirectURI,
  validateRedirectURLs,
} from '@waldur/core/validators';
import { WarnCard } from '@waldur/core/WarnCard';
import { SecretField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

// Component for allowed redirects field with individual URL entries
const AllowedRedirectsField = () => {
  const currentHomeportUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Field
      name="allowed_redirects"
      validate={validateRedirectURLs}
      format={(value) => {
        // Format for display: convert null/undefined to empty array
        if (value === null || value === undefined) {
          return [];
        }
        return Array.isArray(value) ? value : [];
      }}
      parse={(value) => {
        // Parse for submission: always return array (empty array means allow all)
        if (!Array.isArray(value) || value.length === 0) {
          return [];
        }
        return value;
      }}
    >
      {({ input, meta }) => {
        // Format function already ensures input.value is an array
        const urls = input.value;
        const isEmpty = urls.length === 0;

        const addUrl = () => {
          const newUrls = [...urls, ''];
          input.onChange(newUrls);
        };

        const removeUrl = (index: number) => {
          const newUrls = urls.filter((_, i) => i !== index);
          input.onChange(newUrls);
        };

        const updateUrl = (index: number, value: string) => {
          const newUrls = [...urls];
          newUrls[index] = value;
          input.onChange(newUrls);
        };

        return (
          <FormGroup
            label={translate('Allowed Redirect URIs')}
            help={translate(
              'Add individual redirect URIs that are allowed for this provider. Must be origin-only (HTTPS unless localhost, no paths/query/fragments, no trailing slashes). Leave empty to allow any URL.',
            )}
          >
            {urls.map((url, index) => {
              const urlError = redirectURI(url);
              const hasError = urlError && url.trim();

              return (
                <div key={index}>
                  <div className={`input-group mb-${hasError ? '1' : '3'}`}>
                    <input
                      type="text"
                      className={`form-control ${hasError ? 'is-invalid' : ''}`}
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeUrl(index)}
                      title={translate('Remove URL')}
                      aria-label={translate('Remove URL')}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  {hasError && (
                    <small className="d-block text-danger mb-3">
                      {urlError}
                    </small>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              className="btn btn-sm btn-secondary mb-3"
              onClick={addUrl}
            >
              + {translate('Add URL')}
            </button>

            {currentHomeportUrl && (
              <small className="d-block mt-2 text-muted">
                {translate('Current application origin: {url}', {
                  url: currentHomeportUrl,
                })}
              </small>
            )}

            {isEmpty && (
              <div className="mt-3">
                <WarnCard
                  title={translate('Warning')}
                  description={translate(
                    'No allowed redirect URIs configured. The system will fall back to the HOMEPORT_URL setting. For multi-homeport deployments, at least one URI should be specified.',
                  )}
                />
              </div>
            )}

            {meta.error && meta.touched && (
              <div className="alert alert-danger mt-2 mb-0" role="alert">
                {meta.error}
              </div>
            )}
          </FormGroup>
        );
      }}
    </Field>
  );
};

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
    <AllowedRedirectsField />
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
