import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { AlertItem, Badge } from 'waldur-ui';

import { translate } from '@/i18n';
import { WizardModal, WizardStepProps } from '@/wizard';

import type { FieldMappingChoice, OidcFormValues } from '../types';

const buildAttributeMapping = (
  fieldMappings: FieldMappingChoice[],
): Record<string, string> => {
  const mapping: Record<string, string> = {};
  for (const fm of fieldMappings) {
    const claim = fm.isCustom ? fm.customClaim : fm.selectedClaim;
    if (claim) {
      mapping[fm.waldurField] = claim;
    }
  }
  return mapping;
};

export const PreviewStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<OidcFormValues>();
  const providerType = props.data?.providerType;
  const existingProvider = props.data?.existingProvider;

  const attributeMapping = buildAttributeMapping(values.fieldMappings);
  const mappedFields = Object.entries(attributeMapping);

  return (
    <WizardModal {...props}>
      <h4 className="mb-3">{translate('Preview Settings')}</h4>
      <p className="text-quaternary mb-3">
        {translate(
          'Review the settings below before saving. These will configure the identity provider.',
        )}
      </p>

      {/* Connection Card */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">{translate('Connection')}</h5>
        </div>
        <div className="card-body">
          <table className="table table-sm table-borderless">
            <tbody>
              <tr>
                <td className="text-quaternary" style={{ width: '40%' }}>
                  {translate('Provider Type')}
                </td>
                <td>
                  <Badge variant="primary" tone="outline">
                    {providerType}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Discovery URL')}
                </td>
                <td>
                  <code className="wrap-anywhere">{values.discovery_url}</code>
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('Client ID')}</td>
                <td>
                  <code>{values.client_id}</code>
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('Verify SSL')}</td>
                <td>
                  {values.verify_ssl ? translate('Yes') : translate('No')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Attribute Mappings Card */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">{translate('Attribute Mappings')}</h5>
        </div>
        <div className="card-body">
          {mappedFields.length > 0 ? (
            <table className="table table-sm table-borderless">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>{translate('Waldur Field')}</th>
                  <th>{translate('OIDC Claim')}</th>
                </tr>
              </thead>
              <tbody>
                {mappedFields.map(([field, claim]) => (
                  <tr key={field}>
                    <td>
                      <code>{field}</code>
                    </td>
                    <td>
                      <code>{claim}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <span className="text-quaternary">
              {translate('No attribute mappings configured')}
            </span>
          )}
        </div>
      </div>

      {/* Configuration Card */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">{translate('Configuration')}</h5>
        </div>
        <div className="card-body">
          <table className="table table-sm table-borderless">
            <tbody>
              <tr>
                <td className="text-quaternary" style={{ width: '40%' }}>
                  {translate('Label')}
                </td>
                <td>
                  <strong>{values.label}</strong>
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('Extra Scopes')}</td>
                <td>
                  {values.extra_scope ? (
                    <code>{values.extra_scope}</code>
                  ) : (
                    <span className="text-quaternary">{translate('None')}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('User Field')}</td>
                <td>
                  <code>{values.user_field || 'username'}</code>
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('User Claim')}</td>
                <td>
                  <code>{values.user_claim || 'sub'}</code>
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Protected Fields')}
                </td>
                <td>
                  {values.protected_fields ? (
                    <code>{values.protected_fields}</code>
                  ) : (
                    <span className="text-quaternary">{translate('None')}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Management URL')}
                </td>
                <td>
                  {values.management_url ? (
                    <code>{values.management_url}</code>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Not set')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Allowed Redirect URIs')}
                </td>
                <td>
                  {values.allowed_redirects.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {values.allowed_redirects.map((url, i) => (
                        <li key={i}>
                          <code>{url}</code>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Any (fallback to HOMEPORT_URL)')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('PKCE')}</td>
                <td>
                  {values.enable_pkce ? (
                    <Badge variant="success" tone="outline">
                      {translate('Enabled')}
                    </Badge>
                  ) : (
                    <Badge variant="neutral" tone="outline">
                      {translate('Disabled')}
                    </Badge>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Post-Logout Redirect')}
                </td>
                <td>
                  {values.enable_post_logout_redirect ? (
                    <Badge variant="success" tone="outline">
                      {translate('Enabled')}
                    </Badge>
                  ) : (
                    <Badge variant="neutral" tone="outline">
                      {translate('Disabled')}
                    </Badge>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Provider Status')}
                </td>
                <td>
                  {values.is_active ? (
                    <Badge variant="success" tone="outline">
                      {translate('Enabled')}
                    </Badge>
                  ) : (
                    <Badge variant="warning" tone="outline">
                      {translate('Disabled')}
                    </Badge>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <AlertItem
        variant="info"
        type="floating"
        title={
          existingProvider
            ? translate(
                'Click "Update Provider" to apply these changes. Client secret will be securely stored.',
              )
            : translate(
                'Click "Create Provider" to save this configuration. Client secret will be securely stored.',
              )
        }
      />
    </WizardModal>
  );
};
