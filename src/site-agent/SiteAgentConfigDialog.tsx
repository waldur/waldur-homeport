import { useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import {
  marketplaceServiceProvidersGenerateSiteAgentConfig,
  marketplaceServiceProvidersOfferingsList,
} from 'waldur-js-client';

import {
  AlertItem,
  BaseButton,
  Checkbox,
  FormField,
  FormLabel,
  FormText,
  NativeSelect,
} from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
  const { mutate: generateConfig, isPending: isGenerating } =
    useManagedMutation<any, any, void>({
      mutationFn: async () => {
        const response =
          await marketplaceServiceProvidersGenerateSiteAgentConfig({
            path: { uuid: provider.uuid },
            body: {
              offering_uuids: selectedOfferings,
              include_policy_settings: includePolicySettings,
              ...(apiUrl && { waldur_api_url: apiUrl }),
              ...(timezone && { timezone }),
            },
          });
        return response.data;
      },
      onSuccess: (data) => {
        setGeneratedConfig(data);
      },
      successMessage: translate('Configuration generated successfully.'),
      errorMessage: translate('Failed to generate configuration.'),
      closeModal: false,
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
          <BaseButton
            pending={isGenerating}
            label={translate('Generate Configuration')}
            disabled={selectedOfferings.length === 0}
            disabledReason={
              selectedOfferings.length === 0
                ? translate('Please select at least one offering')
                : undefined
            }
            onClick={() => generateConfig()}
            variant="primary"
            size="lg"
          />
        </>
      }
    >
      {fixedOffering ? (
        <>
          {/* Show fixed offering info */}
          <div className="bg-brand-subtle rounded p-2.5 mb-3">
            <div className="text-secondary small mb-1">
              {translate('Generating configuration for:')}
            </div>
            <div className="font-medium">{fixedOffering.name}</div>
          </div>
        </>
      ) : offeringsLoading ? (
        <LoadingSpinner />
      ) : !offerings || offerings.length === 0 ? (
        <AlertItem
          type="floating"
          variant="info"
          title={translate(
            'No SLURM offerings found for this service provider. Create a SLURM offering first.',
          )}
        />
      ) : (
        <FormField className="mb-3">
          <FormLabel>{translate('Select SLURM Offerings')}</FormLabel>
          <div className="mb-1.5">
            <button
              type="button"
              className="text-btn text-brand"
              onClick={handleSelectAll}
            >
              {selectedOfferings.length === offerings.length
                ? translate('Deselect all')
                : translate('Select all')}
            </button>
          </div>
          <div
            className="border rounded p-2.5"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            {offerings.map((offering) => (
              <Checkbox
                id={`offering-${offering.uuid}`}
                checked={selectedOfferings.includes(offering.uuid)}
                onChange={() => handleOfferingToggle(offering.uuid)}
                key={offering.uuid}
                className="mb-1.5"
                label={
                  <span>
                    {offering.name}
                    <span className="text-quaternary ms-1.5">
                      ({offering.uuid.slice(0, 8)}...)
                    </span>
                  </span>
                }
              />
            ))}
          </div>
          <FormText variant="muted">
            {translate('{count} offering(s) selected', {
              count: selectedOfferings.length,
            })}
          </FormText>
        </FormField>
      )}

      {/* Common configuration options - shown for both fixed offering and multi-select cases */}
      {(fixedOffering || (offerings && offerings.length > 0)) && (
        <>
          <FormField className="mb-3">
            <Checkbox
              id="include-policy-settings"
              checked={includePolicySettings}
              onChange={(e) => setIncludePolicySettings(e.target.checked)}
              label={translate('Include SLURM policy settings')}
            />
            <FormText variant="muted">
              {translate(
                'When enabled, includes SLURM periodic usage policy configuration if available.',
              )}
            </FormText>
          </FormField>

          <FormField className="mb-3">
            <FormLabel>{translate('API URL (optional)')}</FormLabel>
            <BaseInputField
              type="url"
              placeholder="https://waldur.example.com/api/"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <FormText variant="muted">
              {translate(
                'Override the Waldur API URL. Leave empty to use the current server URL.',
              )}
            </FormText>
          </FormField>

          <FormField className="mb-3">
            <FormLabel>{translate('Timezone (optional)')}</FormLabel>
            <NativeSelect
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>
                  {tz || translate('Default (server timezone)')}
                </option>
              ))}
            </NativeSelect>
            <FormText variant="muted">
              {translate('Timezone for the site agent scheduler.')}
            </FormText>
          </FormField>
        </>
      )}
    </ModalDialog>
  );
};
