import { FC, useCallback, useMemo } from 'react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { Wizard, WizardStepProps } from '@waldur/wizard';

import { CredentialsStep } from './steps/CredentialsStep';
import { InfrastructureStep } from './steps/InfrastructureStep';
import { LimitsStep } from './steps/LimitsStep';
import { PreviewStep } from './steps/PreviewStep';
import { ProvisioningStep } from './steps/ProvisioningStep';
import type { OpenStackDiscoveryFormValues } from './types';

const steps: ProgressStep[] = [
  { key: 'credentials', label: translate('Credentials'), completed: false },
  {
    key: 'infrastructure',
    label: translate('Infrastructure'),
    completed: false,
  },
  { key: 'provisioning', label: translate('Provisioning'), completed: false },
  { key: 'limits', label: translate('Limits'), completed: false },
  { key: 'preview', label: translate('Preview & Apply'), completed: false },
];

// Wrap PreviewStep to inject offering/refetch from data prop
const PreviewStepWrapper: FC<WizardStepProps> = (props) => {
  const { offering, refetch } = props.data || {};
  return <PreviewStep {...props} offering={offering} refetch={refetch} />;
};

const wizardForms = [
  CredentialsStep,
  InfrastructureStep,
  ProvisioningStep,
  LimitsStep,
  PreviewStepWrapper,
];

interface OwnProps {
  resolve: {
    offering: ProviderOfferingDetails;
    refetch: () => Promise<any>;
  };
}

export const OpenStackDiscoveryDialog: FC<OwnProps> = ({ resolve }) => {
  const { offering, refetch } = resolve;

  const initialValues = useMemo((): Partial<OpenStackDiscoveryFormValues> => {
    const sa = offering.service_attributes || {};
    const po = offering.plugin_options || {};
    return {
      auth_url: (sa.backend_url as string) || '',
      username: (sa.username as string) || '',
      password: '',
      user_domain_name: (sa.user_domain_name as string) || 'Default',
      project_domain_name: (sa.project_domain_name as string) || 'Default',
      project_name: (sa.project_name as string) || 'admin',
      verify_ssl: false,
      certificate: '',
      credentialsValid: false,
      serverInfo: null,

      externalNetworks: [],
      selectedExternalNetworkId: null,
      instanceAZs: [],
      selectedInstanceAZ: null,
      volumeAZs: [],
      selectedVolumeAZ: null,
      volumeTypes: [],
      flavors: [],

      // Provisioning (from service_attributes)
      flavor_exclude_regex: (sa.flavor_exclude_regex as string) || '',
      volume_type_blacklist: (sa.volume_type_blacklist as string) || '',
      console_type: (sa.console_type as string) || '',
      console_domain_override: (sa.console_domain_override as string) || '',
      dns_nameservers: (sa.dns_nameservers as string[]) || [],
      create_ha_routers: (sa.create_ha_routers as boolean) || false,
      live_resize_of_volumes_enabled:
        (sa.live_resize_of_volumes_enabled as boolean) || false,
      max_concurrent_provision_instance:
        (sa.max_concurrent_provision_instance as number) || null,
      max_concurrent_provision_volume:
        (sa.max_concurrent_provision_volume as number) || null,
      max_concurrent_provision_snapshot:
        (sa.max_concurrent_provision_snapshot as number) || null,

      // Limits (from plugin_options)
      default_internal_network_mtu:
        (po.default_internal_network_mtu as number) || null,
      snapshot_size_limit_gb: (po.snapshot_size_limit_gb as number) || null,
      max_instances: (po.max_instances as number) || null,
      max_volumes: (po.max_volumes as number) || null,

      previewResult: null,
    };
  }, [offering]);

  const handleSubmit = useCallback(() => {
    return Promise.resolve();
  }, []);

  const renderFooter = useCallback(() => null, []);

  return (
    <Wizard<OpenStackDiscoveryFormValues>
      title={translate('OpenStack Discovery')}
      subtitle={translate(
        'Discover and configure OpenStack infrastructure for the offering',
      )}
      steps={steps}
      wizardForms={wizardForms}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      renderFooter={renderFooter}
      data={{ offering, refetch }}
      modalProps={{ bodyClassName: 'p-0' }}
    />
  );
};
