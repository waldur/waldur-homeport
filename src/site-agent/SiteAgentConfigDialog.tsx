import { useMutation, useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import {
  marketplaceServiceProvidersGenerateSiteAgentConfig,
  marketplaceServiceProvidersOfferingsList,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

import { SITE_AGENT_PLUGIN } from './constants';
import { SiteAgentConfigPreview } from './SiteAgentConfigPreview';

interface SiteAgentConfigDialogProps {
  resolve: {
    provider: {
      uuid: string;
      customer_name?: string;
    };
    /** When provided, this offering is pre-selected and fixed (cannot be deselected) */
    fixedOffering?: {
      uuid: string;
      name: string;
    };
  };
}

export const SiteAgentConfigDialog: FC<SiteAgentConfigDialogProps> = ({
  resolve: { provider, fixedOffering },
}) => {
  const { showErrorResponse, showSuccess } = useNotify();

  const { closeDialog } = useModal();

  const [selectedOfferings, setSelectedOfferings] = useState<string[]>(
    fixedOffering ? [fixedOffering.uuid] : [],
  );
  const [includePolicySettings, setIncludePolicySettings] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const [timezone, setTimezone] = useState('');
  const [generatedConfig, setGeneratedConfig] = useState<string | null>(null);

  // Fetch SLURM offerings for this service provider
  const { data: offerings, isLoading: offeringsLoading } = useQuery({
    queryKey: ['site-agent-offerings', provider.uuid],
    queryFn: async () => {
      const response = await marketplaceServiceProvidersOfferingsList({
        path: { service_provider_uuid: provider.uuid },
        query: { type: [SITE_AGENT_PLUGIN] },
      });
      return response.data;
    },
  });

  // Generate config mutation
  const { mutate: generateConfig, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      const response = await marketplaceServiceProvidersGenerateSiteAgentConfig(
        {
          path: { uuid: provider.uuid },
          body: {
            offering_uuids: selectedOfferings,
            include_policy_settings: includePolicySettings,
            ...(apiUrl && { waldur_api_url: apiUrl }),
            ...(timezone && { timezone }),
          },
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedConfig(data as unknown as string);
      showSuccess(translate('Configuration generated successfully.'));
    },
    onError: (error: Response) => {
      showErrorResponse(error, translate('Failed to generate configuration.'));
    },
  });

  const handleOfferingToggle = (offeringUuid: string) => {
    // Don't allow deselecting the fixed offering
    if (fixedOffering && offeringUuid === fixedOffering.uuid) {
      return;
    }
    setSelectedOfferings((prev) =>
      prev.includes(offeringUuid)
        ? prev.filter((uuid) => uuid !== offeringUuid)
        : [...prev, offeringUuid],
    );
  };

  const handleSelectAll = () => {
    if (offerings) {
      if (selectedOfferings.length === offerings.length) {
        // When deselecting all, keep the fixed offering if present
        setSelectedOfferings(fixedOffering ? [fixedOffering.uuid] : []);
      } else {
        setSelectedOfferings(offerings.map((o) => o.uuid));
      }
    }
  };

  const timezoneOptions = useMemo(
    () => [
      '',
      'UTC',
      'Europe/Tallinn',
      'Europe/Helsinki',
      'Europe/London',
      'Europe/Berlin',
      'Europe/Paris',
      'America/New_York',
      'America/Chicago',
      'America/Los_Angeles',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney',
    ],
    [],
  );

  if (generatedConfig) {
    return (
      <SiteAgentConfigPreview
        config={generatedConfig}
        onBack={() => setGeneratedConfig(null)}
        onClose={() => closeDialog()}
      />
    );
  }

  return (
    <ModalDialog
      title={translate('Generate Site Agent Configuration')}
      subtitle={translate(
        'Generate a YAML configuration file for waldur-site-agent based on selected SLURM offerings.',
      )}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            submitting={isGenerating}
            label={translate('Generate Configuration')}
            disabled={selectedOfferings.length === 0}
            type="button"
            onClick={() => generateConfig()}
          />
        </>
      }
    >
      {fixedOffering ? (
        <>
          {/* Show fixed offering info */}
          <div className="bg-light-primary rounded p-3 mb-4">
            <div className="text-gray-700 small mb-1">
              {translate('Generating configuration for:')}
            </div>
            <div className="fw-bold">{fixedOffering.name}</div>
          </div>
        </>
      ) : offeringsLoading ? (
        <LoadingSpinner />
      ) : !offerings || offerings.length === 0 ? (
        <Alert variant="info">
          {translate(
            'No SLURM offerings found for this service provider. Create a SLURM offering first.',
          )}
        </Alert>
      ) : (
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">
            {translate('Select SLURM Offerings')}
          </Form.Label>
          <div className="mb-2">
            <button
              type="button"
              className="text-btn text-primary"
              onClick={handleSelectAll}
            >
              {selectedOfferings.length === offerings.length
                ? translate('Deselect all')
                : translate('Select all')}
            </button>
          </div>
          <div
            className="border rounded p-3"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            {offerings.map((offering) => (
              <Form.Check
                key={offering.uuid}
                type="checkbox"
                id={`offering-${offering.uuid}`}
                label={
                  <span>
                    {offering.name}
                    <span className="text-muted ms-2">
                      ({offering.uuid.slice(0, 8)}...)
                    </span>
                  </span>
                }
                checked={selectedOfferings.includes(offering.uuid)}
                onChange={() => handleOfferingToggle(offering.uuid)}
                className="mb-2"
              />
            ))}
          </div>
          <Form.Text className="text-muted">
            {translate('{count} offering(s) selected', {
              count: selectedOfferings.length,
            })}
          </Form.Text>
        </Form.Group>
      )}

      {/* Common configuration options - shown for both fixed offering and multi-select cases */}
      {(fixedOffering || (offerings && offerings.length > 0)) && (
        <>
          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="include-policy-settings"
              label={translate('Include SLURM policy settings')}
              checked={includePolicySettings}
              onChange={(e) => setIncludePolicySettings(e.target.checked)}
            />
            <Form.Text className="text-muted">
              {translate(
                'When enabled, includes SLURM periodic usage policy configuration if available.',
              )}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>{translate('API URL (optional)')}</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://waldur.example.com/api/"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <Form.Text className="text-muted">
              {translate(
                'Override the Waldur API URL. Leave empty to use the current server URL.',
              )}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>{translate('Timezone (optional)')}</Form.Label>
            <Form.Select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>
                  {tz || translate('Default (server timezone)')}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              {translate('Timezone for the site agent scheduler.')}
            </Form.Text>
          </Form.Group>
        </>
      )}
    </ModalDialog>
  );
};
