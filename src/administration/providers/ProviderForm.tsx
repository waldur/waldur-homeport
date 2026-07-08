import { Field, useFormState } from 'react-final-form';

import { required, redirectURI, validateRedirectURLs } from '@/core/validators';
import { WarnCard } from '@/core/WarnCard';
import {
  BooleanGroup,
  CommaSeparatedListGroup,
  SecretGroup,
  StringGroup,
} from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import {
  isProfileAttributeEnabled,
  ProfileAttribute,
} from '@/user/support/profileAttributes';

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
              'Add individual redirect URIs that are allowed for this provider. Must be origin-only (HTTPS unless localhost, no paths/query/fragments, no trailing slashes). Leave empty to fall back to the HOMEPORT_URL branding setting (Administration → Branding) — verify that value is correct, otherwise SSO logins will redirect to the wrong host.',
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

// Waldur user fields that can be mapped to an OIDC claim.
// Must stay in sync with WRITABLE_USER_FIELDS in waldur-mastermind
// (waldur_auth_social/const.py) — the backend rejects any other key.
const ATTRIBUTE_MAPPING_FIELDS: Array<{ field: string; label: string }> = [
  { field: 'first_name', label: translate('First name field') },
  { field: 'last_name', label: translate('Last name field') },
  { field: 'email', label: translate('Email field') },
  { field: 'phone_number', label: translate('Phone number field') },
  { field: 'personal_title', label: translate('Personal title field') },
  { field: 'gender', label: translate('Gender field') },
  { field: 'birth_date', label: translate('Birth date field') },
  { field: 'place_of_birth', label: translate('Place of birth field') },
  { field: 'address', label: translate('Address field') },
  {
    field: 'country_of_residence',
    label: translate('Country of residence field'),
  },
  { field: 'nationality', label: translate('Nationality field') },
  { field: 'nationalities', label: translate('Nationalities field') },
  { field: 'civil_number', label: translate('Civil number field') },
  { field: 'affiliations', label: translate('Affiliations field') },
  { field: 'identity_source', label: translate('Identity source field') },
  {
    field: 'eduperson_assurance',
    label: translate('eduPerson assurance field'),
  },
  { field: 'uid_number', label: translate('UID number field') },
  { field: 'primary_gid', label: translate('Primary GID field') },
  { field: 'organization', label: translate('Organization field') },
  { field: 'organization_type', label: translate('Organization type field') },
  {
    field: 'organization_country',
    label: translate('Organization country field'),
  },
  {
    field: 'organization_registry_code',
    label: translate('Organization registry code field'),
  },
  {
    field: 'organization_vat_code',
    label: translate('Organization VAT code field'),
  },
  {
    field: 'organization_address',
    label: translate('Organization address field'),
  },
];

export const ProviderForm = () => {
  // Show a mapping row only for attributes that are enabled for this
  // deployment (ENABLED_USER_PROFILE_ATTRIBUTES). Mappings to disabled
  // attributes are silently dropped during IdP sync, so surfacing them
  // would be misleading. Keep any attribute that already has a saved
  // mapping so legacy configuration stays visible and editable.
  const { values } = useFormState({ subscription: { values: true } });
  const savedMapping: Record<string, unknown> = values?.attribute_mapping ?? {};
  const visibleMappingFields = ATTRIBUTE_MAPPING_FIELDS.filter(
    ({ field }) =>
      isProfileAttributeEnabled(field as ProfileAttribute) ||
      Boolean(savedMapping[field]),
  );

  return (
    <>
      <StringGroup
        name="label"
        validate={required}
        label={translate('Label')}
        required={true}
      />
      <StringGroup
        name="client_id"
        validate={required}
        label={translate('Client ID')}
        required={true}
        help={translate('ID of application used for OAuth authentication.')}
      />
      <SecretGroup
        name="client_secret"
        validate={required}
        label={translate('Client secret')}
        required={true}
        help={translate('Application secret key.')}
      />
      <StringGroup
        name="discovery_url"
        validate={required}
        label={translate('Discovery URL')}
        required={true}
        help={translate('The endpoint for endpoint discovery.')}
      />
      <StringGroup
        name="management_url"
        label={translate('Profile management URL')}
        help={translate('The endpoint for user details management.')}
      />
      <CommaSeparatedListGroup
        name="protected_fields"
        label={translate('Protected fields')}
        help={translate(
          'Enter a comma separated list of fields of the user profile that would be protected from editing in Waldur.',
        )}
      />
      <StringGroup
        name="extra_scope"
        label={translate('Extra scope')}
        help={translate(
          'Space-separated list of scopes to request during authentication.',
        )}
      />
      <StringGroup
        name="extra_fields"
        label={translate('Extra fields')}
        help={translate(
          'Space-separated list of additional OIDC claims to persist in the user profile details.',
        )}
      />
      <StringGroup
        name="user_field"
        placeholder="username"
        label={translate('User field')}
        help={translate('The field to be used for looking up the user.')}
      />
      <StringGroup
        name="user_claim"
        placeholder="sub"
        label={translate('User claim')}
        help={translate(
          'Space seprated list of OIDC claims to be used as the value for the lookup field.',
        )}
      />
      {visibleMappingFields.map(({ field, label }) => (
        <StringGroup
          key={field}
          name={`attribute_mapping.${field}`}
          label={label}
          help={translate(
            'The OIDC claim to be used as the value for this field.',
          )}
        />
      ))}
      <AllowedRedirectsField />
      <BooleanGroup name="is_active" label={translate('Enabled')} />
      <BooleanGroup name="verify_ssl" label={translate('Verify SSL')} />
      <BooleanGroup
        name="enable_post_logout_redirect"
        label={translate('Enable post logout redirect')}
      />
      <BooleanGroup name="enable_pkce" label={translate('Enable PKCE')} />
    </>
  );
};
