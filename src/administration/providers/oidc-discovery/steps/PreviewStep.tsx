import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  identityProvidersCreate,
  identityProvidersUpdate,
  IdentityProviderRequest,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import type { OidcDiscoveryState, OidcDiscoveryDialogResolve } from '../types';

interface PreviewStepProps {
  state: OidcDiscoveryState;
  resolve: OidcDiscoveryDialogResolve;
  onBack: () => void;
  onCancel: () => void;
}

export const PreviewStep = ({
  state,
  resolve,
  onBack,
  onCancel,
}: PreviewStepProps) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  // Build attribute_mapping from fieldMappings
  const buildAttributeMapping = (): Record<string, string> => {
    const mapping: Record<string, string> = {};
    for (const fm of state.fieldMappings) {
      const claim = fm.isCustom ? fm.customClaim : fm.selectedClaim;
      if (claim) {
        mapping[fm.waldurField] = claim;
      }
    }
    return mapping;
  };

  // Build protected_fields array from comma-separated string
  const buildProtectedFields = (): string[] => {
    const fields = state.configuration.protected_fields
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
    return fields;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const providerData: IdentityProviderRequest = {
        provider: resolve.type,
        discovery_url: state.connection!.discovery_url,
        client_id: state.clientId,
        client_secret: state.clientSecret,
        verify_ssl: state.connection!.verify_ssl,
        label: state.configuration.label,
        management_url: state.configuration.management_url || undefined,
        protected_fields: buildProtectedFields(),
        extra_scope: state.configuration.extra_scope || undefined,
        user_field: state.configuration.user_field || undefined,
        user_claim: state.configuration.user_claim || undefined,
        allowed_redirects: state.configuration.allowed_redirects,
        enable_pkce: state.configuration.enable_pkce,
        enable_post_logout_redirect:
          state.configuration.enable_post_logout_redirect,
        is_active: state.configuration.is_active,
        attribute_mapping: buildAttributeMapping(),
      };

      if (state.existingProvider) {
        await identityProvidersUpdate({
          path: { provider: resolve.type },
          body: providerData,
        });
        dispatch(
          showSuccess(translate('Identity provider updated successfully')),
        );
      } else {
        await identityProvidersCreate({
          body: providerData,
        });
        dispatch(
          showSuccess(translate('Identity provider created successfully')),
        );
      }

      queryClient.invalidateQueries({
        queryKey: ['IdentityProviders'],
      });

      resolve.refetch();
      dispatch(closeModalDialog());
    } catch (e: any) {
      dispatch(
        showErrorResponse(e, translate('Failed to save identity provider')),
      );
    } finally {
      setSaving(false);
    }
  };

  const attributeMapping = buildAttributeMapping();
  const mappedFields = Object.entries(attributeMapping);

  return (
    <div>
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
                    {resolve.type}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Discovery URL')}</td>
                <td>
                  <code className="text-break">
                    {state.connection?.discovery_url}
                  </code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Client ID')}</td>
                <td>
                  <code>{state.clientId}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Verify SSL')}</td>
                <td>
                  {state.connection?.verify_ssl
                    ? translate('Yes')
                    : translate('No')}
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
                  <strong>{state.configuration.label}</strong>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Extra Scopes')}</td>
                <td>
                  {state.configuration.extra_scope ? (
                    <code>{state.configuration.extra_scope}</code>
                  ) : (
                    <span className="text-muted">{translate('None')}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('User Field')}</td>
                <td>
                  <code>{state.configuration.user_field || 'username'}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('User Claim')}</td>
                <td>
                  <code>{state.configuration.user_claim || 'sub'}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Protected Fields')}</td>
                <td>
                  {state.configuration.protected_fields ? (
                    <code>{state.configuration.protected_fields}</code>
                  ) : (
                    <span className="text-muted">{translate('None')}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Management URL')}</td>
                <td>
                  {state.configuration.management_url ? (
                    <code>{state.configuration.management_url}</code>
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
                  {state.configuration.allowed_redirects.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {state.configuration.allowed_redirects.map((url, i) => (
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
                  {state.configuration.enable_pkce ? (
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
                  {state.configuration.enable_post_logout_redirect ? (
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
                  {state.configuration.is_active ? (
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
        {translate(
          'Note: Client secret will be securely stored and is not shown in this preview.',
        )}
      </Alert>

      <div className="d-flex justify-content-end gap-2 mt-6">
        <ActionButton
          action={onCancel}
          variant="secondary"
          title={translate('Cancel')}
        />
        <ActionButton
          action={onBack}
          variant="tertiary"
          title={translate('Back')}
        />
        <SubmitButton
          submitting={saving}
          onClick={handleSave}
          label={
            state.existingProvider
              ? translate('Update Provider')
              : translate('Create Provider')
          }
          type="button"
        />
      </div>
    </div>
  );
};
