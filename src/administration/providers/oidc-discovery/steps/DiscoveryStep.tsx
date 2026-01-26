import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import { identityProvidersDiscoverMetadata } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { WarnCard } from '@waldur/core/WarnCard';
import { translate } from '@waldur/i18n';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import type { OidcFormValues } from '../types';

export const DiscoveryStep: FC<WizardStepProps> = (props) => {
  const form = useForm<OidcFormValues>();
  const { values } = useFormState<OidcFormValues>();
  const [manualClaimInput, setManualClaimInput] = useState('');

  // Auto-fix discovery URL if it doesn't contain the well-known path
  const getDiscoveryUrl = (url: string) => {
    if (!url) return url;
    if (!url.includes('.well-known/openid-configuration')) {
      return url.endsWith('/')
        ? `${url}.well-known/openid-configuration`
        : `${url}/.well-known/openid-configuration`;
    }
    return url;
  };

  const discoveryUrl = getDiscoveryUrl(values.discovery_url);

  const {
    data: discoveryResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['OidcDiscovery', discoveryUrl],
    queryFn: async () => {
      const response = await identityProvidersDiscoverMetadata({
        body: {
          discovery_url: discoveryUrl,
          verify_ssl: values.verify_ssl,
        },
      });
      return response.data;
    },
    enabled: Boolean(discoveryUrl),
    staleTime: 0,
    retry: false,
  });

  // Store discovery result in form when it changes
  useEffect(() => {
    if (discoveryResult && discoveryResult !== values.discoveryResult) {
      form.change('discoveryResult', discoveryResult);
      // Update discovery_url to the fixed version
      if (discoveryUrl !== values.discovery_url) {
        form.change('discovery_url', discoveryUrl);
      }
    }
  }, [
    discoveryResult,
    form,
    values.discoveryResult,
    discoveryUrl,
    values.discovery_url,
  ]);

  const claimsNotExposed =
    !discoveryResult?.claims_supported ||
    discoveryResult.claims_supported.length === 0;

  const handleAddManualClaim = () => {
    if (manualClaimInput.trim()) {
      const newClaims = [
        ...(values.manualClaims || []),
        manualClaimInput.trim(),
      ];
      form.change('manualClaims', newClaims);
      setManualClaimInput('');
    }
  };

  const handleRemoveManualClaim = (claim: string) => {
    const newClaims = (values.manualClaims || []).filter((c) => c !== claim);
    form.change('manualClaims', newClaims);
  };

  const allClaims = [
    ...(discoveryResult?.claims_supported || []),
    ...(values.manualClaims || []),
  ];

  // Show loading state
  if (isLoading) {
    return (
      <WizardModal {...props} submitDisabled>
        <div className="text-center py-10">
          <LoadingSpinner />
          <p className="mt-4 text-muted">
            {translate('Discovering OIDC metadata from identity provider...')}
          </p>
        </div>
      </WizardModal>
    );
  }

  // Show error state
  if (error) {
    return (
      <WizardModal {...props} submitDisabled>
        <LoadingErred
          message={translate('Failed to discover OIDC metadata')}
          loadData={refetch}
        />
        <Alert variant="danger" className="mt-4">
          {(error as Error).message ||
            translate('Unable to connect to the discovery endpoint.')}
        </Alert>
      </WizardModal>
    );
  }

  if (!discoveryResult) {
    return (
      <WizardModal {...props} submitDisabled>
        <div className="text-center py-10 text-muted">
          {translate('No discovery results available.')}
        </div>
      </WizardModal>
    );
  }

  return (
    <WizardModal {...props}>
      <h4 className="mb-4">{translate('Discovery Results')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'The following information was discovered from your identity provider.',
        )}
      </p>

      {/* Endpoints Card */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Discovered Endpoints')}</h5>
        </Card.Header>
        <Card.Body>
          <Table borderless size="sm">
            <tbody>
              {Object.entries(discoveryResult.endpoints || {}).map(
                ([key, value]) => (
                  <tr key={key}>
                    <td className="text-muted" style={{ width: '30%' }}>
                      {key.replace(/_/g, ' ')}
                    </td>
                    <td>
                      <code className="text-break">{value}</code>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Claims Card */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Supported Claims')}</h5>
        </Card.Header>
        <Card.Body>
          {claimsNotExposed && (
            <WarnCard
              title={translate('Claims not exposed')}
              description={translate(
                'This identity provider does not expose its supported claims in the discovery document. You can manually add claim names below based on your IdP documentation.',
              )}
            />
          )}

          {allClaims.length > 0 ? (
            <div className="d-flex flex-wrap gap-2 mb-4">
              {allClaims.map((claim) => (
                <Badge
                  key={claim}
                  variant={
                    values.manualClaims?.includes(claim) ? 'warning' : 'default'
                  }
                  outline
                >
                  {claim}
                  {values.manualClaims?.includes(claim) && (
                    <button
                      type="button"
                      className="btn-close ms-2"
                      style={{ fontSize: '0.5em' }}
                      onClick={() => handleRemoveManualClaim(claim)}
                      aria-label={translate('Remove')}
                    />
                  )}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-4">
              {translate('No claims discovered. Add claims manually below.')}
            </p>
          )}

          <div className="d-flex gap-2 align-items-start">
            <div className="flex-grow-1">
              <input
                type="text"
                className="form-control"
                value={manualClaimInput}
                onChange={(e) => setManualClaimInput(e.target.value)}
                placeholder={translate(
                  'Enter claim name (e.g., preferred_username)',
                )}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddManualClaim}
              disabled={!manualClaimInput.trim()}
            >
              {translate('Add Claim')}
            </button>
          </div>
        </Card.Body>
      </Card>

      {/* Suggested Scopes Card */}
      {discoveryResult.suggested_scopes &&
        discoveryResult.suggested_scopes.length > 0 && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">{translate('Suggested Scopes')}</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-2">
                {translate(
                  'These scopes are recommended based on the discovered claim mappings.',
                )}
              </p>
              <div className="d-flex flex-wrap gap-2">
                {discoveryResult.suggested_scopes.map((scope) => (
                  <Badge key={scope} variant="primary" outline>
                    {scope}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

      {/* Waldur Fields Card */}
      {discoveryResult.waldur_fields &&
        discoveryResult.waldur_fields.length > 0 && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">{translate('Mappable User Fields')}</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-2">
                {translate(
                  '{count} Waldur user fields can be mapped to OIDC claims.',
                  { count: discoveryResult.waldur_fields.length },
                )}
              </p>
              <Table size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>{translate('Field')}</th>
                    <th>{translate('Description')}</th>
                    <th>{translate('Available Claims')}</th>
                  </tr>
                </thead>
                <tbody>
                  {discoveryResult.waldur_fields.slice(0, 5).map((field) => (
                    <tr key={field.field}>
                      <td>
                        <code>{field.field}</code>
                      </td>
                      <td className="text-muted">{field.description}</td>
                      <td>
                        {field.available_claims.length > 0 ? (
                          <span className="text-success">
                            {field.available_claims.slice(0, 2).join(', ')}
                            {field.available_claims.length > 2 &&
                              ` +${field.available_claims.length - 2}`}
                          </span>
                        ) : (
                          <span className="text-muted">
                            {translate('None')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {discoveryResult.waldur_fields.length > 5 && (
                <p className="text-muted mt-2 mb-0">
                  {translate('...and {count} more fields', {
                    count: discoveryResult.waldur_fields.length - 5,
                  })}
                </p>
              )}
            </Card.Body>
          </Card>
        )}
    </WizardModal>
  );
};
