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
  LinkButton,
  NativeSelect,
  RadioGroup,
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

// Where the agent takes each offering's configuration from: the whole of it
// from this file, or only how to reach Waldur and the secrets, the rest read
// from Waldur when the agent starts.
type ConfigurationSource = 'local' | 'waldur';

const getSourceOptions = () => [
  {
    value: 'local' as const,
    label: translate('Everything in the file'),
    description: translate(
      'The file holds the whole configuration. A change made in Waldur needs a new file.',
    ),
  },
  {
    value: 'waldur' as const,
    label: translate('Read from Waldur'),
    description: translate(
      'The file holds only how to reach Waldur and the secrets; the agent reads the rest from Waldur when it starts. Needs waldur-site-agent 1.0.8-rc.16 or later: an older agent ignores configuration_source without a warning.',
    ),
  },
];

// How the offerings are chosen: one by one, or by backend ID, which picks
// every offering of a cluster (alps-dora-q, alps-dora-u, ...) by its prefix.
type SelectionMode = 'pick' | 'backend_id';
type BackendIdMatch = 'startswith' | 'exact';

const getSelectionOptions = () => [
  {
    value: 'pick' as const,
    label: translate('Choose offerings'),
  },
  {
    value: 'backend_id' as const,
    label: translate('By backend ID'),
    description: translate(
      'Every offering whose backend ID matches, such as all offerings of one cluster. Archived offerings are left out.',
    ),
  },
];

const getMatchOptions = () => [
  { value: 'startswith' as const, label: translate('Starts with') },
  { value: 'exact' as const, label: translate('Is exactly') },
];

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
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('pick');
  const [backendId, setBackendId] = useState('');
  const [backendIdMatch, setBackendIdMatch] =
    useState<BackendIdMatch>('startswith');
  const byBackendId = !fixedOffering && selectionMode === 'backend_id';
  const nothingSelected = byBackendId
    ? !backendId.trim()
    : selectedOfferings.length === 0;
  const [configurationSource, setConfigurationSource] =
    useState<ConfigurationSource>('local');
  const [includePolicySettings, setIncludePolicySettings] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  const [timezone, setTimezone] = useState('');
  const [generatedConfig, setGeneratedConfig] = useState<string | null>(null);

  // Fetch the site agent offerings of this service provider
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
              ...(byBackendId
                ? {
                    [backendIdMatch === 'exact'
                      ? 'backend_id'
                      : 'backend_id_startswith']: backendId.trim(),
                  }
                : { offering_uuids: selectedOfferings }),
              // Sent only when not the server's default, 'local'; Waldur
              // always serves the policy settings to an agent reading them.
              ...(configurationSource === 'waldur'
                ? { configuration_source: configurationSource }
                : { include_policy_settings: includePolicySettings }),
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
      errorMessage: byBackendId
        ? translate(
            'Failed to generate configuration. Check that an offering has a matching backend ID.',
          )
        : translate('Failed to generate configuration.'),
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
        'Generate a YAML configuration file for waldur-site-agent from the selected site agent offerings.',
      )}
      footer={
        <>
          <CloseDialogButton />
          <BaseButton
            pending={isGenerating}
            label={translate('Generate Configuration')}
            disabled={nothingSelected}
            disabledReason={
              nothingSelected
                ? byBackendId
                  ? translate('Enter a backend ID')
                  : translate('Please select at least one offering')
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
          <div className="bg-brand-subtle rounded-lg p-2.5 mb-3">
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
            'The service provider has no site agent offerings. Create one first.',
          )}
        />
      ) : (
        <>
          <RadioGroup<SelectionMode>
            className="mb-3"
            label={translate('Offerings')}
            options={getSelectionOptions()}
            value={selectionMode}
            onValueChange={setSelectionMode}
          />
          {byBackendId ? (
            <FormField className="mb-3">
              <FormLabel>{translate('Backend ID')}</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-2">
                <NativeSelect
                  value={backendIdMatch}
                  onChange={(e) =>
                    setBackendIdMatch(e.target.value as BackendIdMatch)
                  }
                  aria-label={translate('Match')}
                  data-testid="backend-id-match"
                >
                  {getMatchOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelect>
                <BaseInputField
                  containerClassName="sm:col-span-2"
                  placeholder="alps-dora"
                  value={backendId}
                  onChange={(e) => setBackendId(e.target.value)}
                  aria-label={translate('Backend ID')}
                  data-testid="backend-id"
                />
              </div>
              <FormText variant="muted">
                {translate(
                  'The same filter is available without the file: GET marketplace-service-providers/<uuid>/site_agent_config/ with backend_id or backend_id_startswith.',
                )}
              </FormText>
            </FormField>
          ) : (
            <FormField className="mb-3">
              <FormLabel>{translate('Select site agent offerings')}</FormLabel>
              <div className="mb-1.5">
                <LinkButton onClick={handleSelectAll}>
                  {selectedOfferings.length === offerings.length
                    ? translate('Deselect all')
                    : translate('Select all')}
                </LinkButton>
              </div>
              <div className="border border-secondary rounded-lg p-2.5 overflow-y-auto max-h-50">
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
        </>
      )}

      {/* Common configuration options - shown for both fixed offering and multi-select cases */}
      {(fixedOffering || (offerings && offerings.length > 0)) && (
        <>
          <RadioGroup<ConfigurationSource>
            className="mb-3"
            label={translate('Configuration source')}
            options={getSourceOptions()}
            value={configurationSource}
            onValueChange={setConfigurationSource}
          />

          {configurationSource === 'local' && (
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
          )}

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
