import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import { identityProvidersDiscoverMetadata } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { WarnCard } from '@waldur/core/WarnCard';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

import type { StepProps } from '../types';

export const DiscoveryStep = ({
  state,
  updateState,
  onNext,
  onBack,
  onCancel,
}: StepProps) => {
  const [manualClaimInput, setManualClaimInput] = useState('');

  const {
    data: discoveryResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['OidcDiscovery', state.connection?.discovery_url],
    queryFn: async () => {
      if (!state.connection) {
        throw new Error('Connection not configured');
      }
      const response = await identityProvidersDiscoverMetadata({
        body: state.connection,
      });
      return response.data;
    },
    enabled: Boolean(state.connection),
    staleTime: 0,
    retry: false,
  });

  const claimsNotExposed =
    !discoveryResult?.claims_supported ||
    discoveryResult.claims_supported.length === 0;

  const handleAddManualClaim = () => {
    if (manualClaimInput.trim()) {
      const newClaims = [
        ...(state.manualClaims || []),
        manualClaimInput.trim(),
      ];
      updateState({ manualClaims: newClaims });
      setManualClaimInput('');
    }
  };

  const handleRemoveManualClaim = (claim: string) => {
    const newClaims = (state.manualClaims || []).filter((c) => c !== claim);
    updateState({ manualClaims: newClaims });
  };

  const handleContinue = () => {
    updateState({
      discoveryResult: discoveryResult || null,
      claimsNotExposed,
    });
    onNext();
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <LoadingSpinner />
        <p className="mt-4 text-muted">
          {translate('Discovering OIDC metadata from identity provider...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <LoadingErred
          message={translate('Failed to discover OIDC metadata')}
          loadData={refetch}
        />
        <Alert variant="danger" className="mt-4">
          {(error as Error).message ||
            translate('Unable to connect to the discovery endpoint.')}
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
        </div>
      </div>
    );
  }

  if (!discoveryResult) {
    return null;
  }

  const allClaims = [
    ...(discoveryResult.claims_supported || []),
    ...(state.manualClaims || []),
  ];

  return (
    <div>
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
                    state.manualClaims?.includes(claim) ? 'warning' : 'default'
                  }
                  outline
                >
                  {claim}
                  {state.manualClaims?.includes(claim) && (
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
            <ActionButton
              action={handleAddManualClaim}
              variant="secondary"
              title={translate('Add Claim')}
              disabled={!manualClaimInput.trim()}
            />
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
          submitting={false}
          onClick={handleContinue}
          label={translate('Continue to Mapping')}
          type="button"
        />
      </div>
    </div>
  );
};
