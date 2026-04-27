import { FC } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import { useFormState } from 'react-final-form';

import { Badge } from '@/core/Badge';
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
      <h4 className="mb-4">{translate('Preview Settings')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'Review the settings below before saving. These will configure the identity provider.',
        )}
      </p>

      {/* Connection Card */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Connection')}</h5>
        </Card.Header>
        <Card.Body>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td className="text-muted" style={{ width: '40%' }}>
                  {translate('Provider Type')}
                </td>
                <td>
                  <Badge variant="primary" outline>
                    {providerType}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Discovery URL')}</td>
                <td>
                  <code className="text-break">{values.discovery_url}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Client ID')}</td>
                <td>
                  <code>{values.client_id}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Verify SSL')}</td>
                <td>
                  {values.verify_ssl ? translate('Yes') : translate('No')}
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Attribute Mappings Card */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Attribute Mappings')}</h5>
        </Card.Header>
        <Card.Body>
          {mappedFields.length > 0 ? (
            <Table borderless size="sm">
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
            </Table>
          ) : (
            <span className="text-muted">
              {translate('No attribute mappings configured')}
            </span>
          )}
        </Card.Body>
      </Card>

      {/* Configuration Card */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Configuration')}</h5>
        </Card.Header>
        <Card.Body>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td className="text-muted" style={{ width: '40%' }}>
                  {translate('Label')}
                </td>
                <td>
                  <strong>{values.label}</strong>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Extra Scopes')}</td>
                <td>
                  {values.extra_scope ? (
                    <code>{values.extra_scope}</code>
                  ) : (
                    <span className="text-muted">{translate('None')}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('User Field')}</td>
                <td>
                  <code>{values.user_field || 'username'}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('User Claim')}</td>
                <td>
                  <code>{values.user_claim || 'sub'}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Protected Fields')}</td>
                <td>
                  {values.protected_fields ? (
                    <code>{values.protected_fields}</code>
                  ) : (
                    <span className="text-muted">{translate('None')}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Management URL')}</td>
                <td>
                  {values.management_url ? (
                    <code>{values.management_url}</code>
                  ) : (
                    <span className="text-muted">{translate('Not set')}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">
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
                    <span className="text-muted">
                      {translate('Any (fallback to HOMEPORT_URL)')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('PKCE')}</td>
                <td>
                  {values.enable_pkce ? (
                    <Badge variant="success" outline>
                      {translate('Enabled')}
                    </Badge>
                  ) : (
                    <Badge variant="default" outline>
                      {translate('Disabled')}
                    </Badge>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Post-Logout Redirect')}
                </td>
                <td>
                  {values.enable_post_logout_redirect ? (
                    <Badge variant="success" outline>
                      {translate('Enabled')}
                    </Badge>
                  ) : (
                    <Badge variant="default" outline>
                      {translate('Disabled')}
                    </Badge>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Provider Status')}</td>
                <td>
                  {values.is_active ? (
                    <Badge variant="success" outline>
                      {translate('Enabled')}
                    </Badge>
                  ) : (
                    <Badge variant="warning" outline>
                      {translate('Disabled')}
                    </Badge>
                  )}
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Alert variant="info">
        {existingProvider
          ? translate(
              'Click "Update Provider" to apply these changes. Client secret will be securely stored.',
            )
          : translate(
              'Click "Create Provider" to save this configuration. Client secret will be securely stored.',
            )}
      </Alert>
    </WizardModal>
  );
};
