import { FC, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';

import { required, validateRedirectURLs, redirectURI } from '@/core/validators';
import { StringField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { WizardModal, WizardStepProps } from '@/wizard';

import type { OidcFormValues } from '../types';

// Component for allowed redirects field with individual URL entries
const AllowedRedirectsField: FC = () => {
  const currentHomeportUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Field
      name="allowed_redirects"
      validate={validateRedirectURLs}
      format={(value) => {
        if (value === null || value === undefined) {
          return [];
        }
        return Array.isArray(value) ? value : [];
      }}
      parse={(value) => {
        if (!Array.isArray(value) || value.length === 0) {
          return [];
        }
        return value;
      }}
    >
      {({ input, meta }) => {
        const urls = input.value;

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
            description={translate(
              'Add individual redirect URIs that are allowed for this provider. Leave empty to fall back to the HOMEPORT_URL branding setting (Administration → Branding) — verify that value is correct, otherwise SSO logins will redirect to the wrong host.',
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

export const ConfigurationStep: FC<WizardStepProps> = (props) => {
  const form = useForm<OidcFormValues>();
  const { values } = useFormState<OidcFormValues>();
  const existingProvider = props.data?.existingProvider;

  // Initialize configuration with suggested scopes if not already set
  useEffect(() => {
    if (!values.extra_scope && values.discoveryResult?.suggested_scopes) {
      const suggestedScopes = values.discoveryResult.suggested_scopes;
      const existingScopes = existingProvider?.extra_scope || '';

      // Merge existing scopes with suggested scopes
      const scopeSet = new Set<string>();
      existingScopes
        .split(' ')
        .filter(Boolean)
        .forEach((s) => scopeSet.add(s));
      suggestedScopes.forEach((s) => scopeSet.add(s));

      form.change('extra_scope', [...scopeSet].join(' '));
    }
  }, [
    values.discoveryResult?.suggested_scopes,
    values.extra_scope,
    existingProvider,
    form,
  ]);

  return (
    <WizardModal {...props}>
      <h4 className="mb-4">{translate('Provider Configuration')}</h4>
      <p className="text-muted mb-4">
        {translate('Configure additional settings for the identity provider.')}
      </p>

      <FormGroup
        label={translate('Label')}
        description={translate(
          'A human-readable name for this identity provider.',
        )}
        required
      >
        <Field
          name="label"
          component={StringField as any}
          validate={required}
        />
      </FormGroup>

      <FormGroup
        label={translate('Extra Scopes')}
        description={translate(
          'Space-separated list of scopes to request during authentication. Suggested scopes have been pre-filled.',
        )}
      >
        <Field name="extra_scope" component={StringField as any} />
      </FormGroup>

      <FormGroup
        label={translate('User Field')}
        description={translate(
          'The Waldur user field to use for looking up existing users.',
        )}
      >
        <Field
          name="user_field"
          component={StringField as any}
          placeholder="username"
        />
      </FormGroup>

      <FormGroup
        label={translate('User Claim')}
        description={translate(
          'The OIDC claim to use as the value for user lookup.',
        )}
      >
        <Field
          name="user_claim"
          component={StringField as any}
          placeholder="sub"
        />
      </FormGroup>

      <FormGroup
        label={translate('Protected Fields')}
        description={translate(
          'Comma-separated list of user profile fields that should not be editable in Waldur.',
        )}
      >
        <Field name="protected_fields" component={StringField as any} />
      </FormGroup>

      <FormGroup
        label={translate('Management URL')}
        description={translate(
          'URL where users can manage their identity provider account.',
        )}
      >
        <Field name="management_url" component={StringField as any} />
      </FormGroup>

      <AllowedRedirectsField />

      <Form.Group className="mb-4">
        <Field
          name="enable_pkce"
          component={AwesomeCheckboxField as any}
          label={translate('Enable PKCE')}
        />
        <small className="text-muted d-block mt-1">
          {translate(
            'Proof Key for Code Exchange - recommended for public clients.',
          )}
        </small>
      </Form.Group>

      <Form.Group className="mb-4">
        <Field
          name="enable_post_logout_redirect"
          component={AwesomeCheckboxField as any}
          label={translate('Enable Post-Logout Redirect')}
        />
        <small className="text-muted d-block mt-1">
          {translate(
            'Redirect users back to Waldur after logging out from the IdP.',
          )}
        </small>
      </Form.Group>

      <Form.Group className="mb-4">
        <Field
          name="is_active"
          component={AwesomeCheckboxField as any}
          label={translate('Enable Provider')}
        />
        <small className="text-muted d-block mt-1">
          {translate(
            'When enabled, users will be able to authenticate using this provider.',
          )}
        </small>
      </Form.Group>
    </WizardModal>
  );
};
