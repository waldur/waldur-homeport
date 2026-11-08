import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC, useEffect, useState } from 'react';
import { useForm, useFormState } from 'react-final-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  openstackDiscoveryPreviewServiceAttributes,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import {
  AlertItem,
  BaseButton,
  PropertyCard,
  PropertyItem,
  PropertyList,
  Code,
} from 'waldur-ui';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { propVal } from '@/property/propertyFields';
import { StepLoading, WizardModal, WizardStepProps } from '@/wizard';

import { extractCredentials, OpenStackDiscoveryFormValues } from '../types';

interface PreviewStepProps extends WizardStepProps {
  offering: ProviderOfferingDetails;
  refetch: () => Promise<any>;
}

export const PreviewStep: FC<PreviewStepProps> = (props) => {
  const form = useForm<OpenStackDiscoveryFormValues>();
  const { values } = useFormState<OpenStackDiscoveryFormValues>();
  const [loading, setLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      setPreviewError(null);

      try {
        const response = await openstackDiscoveryPreviewServiceAttributes({
          body: {
            ...extractCredentials(values),
            external_network_id: values.selectedExternalNetworkId || '',
            ...(values.selectedInstanceAZ && {
              instance_availability_zone: values.selectedInstanceAZ,
            }),
            ...(values.selectedVolumeAZ && {
              volume_availability_zone: values.selectedVolumeAZ,
            }),
          },
        });
        form.change('previewResult', response.data);
      } catch (e: any) {
        setPreviewError(
          e.response?.data?.detail ||
            e.response?.data?.error ||
            e.message ||
            translate('Failed to preview service attributes'),
        );
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, []);

  const applyMutation = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      if (!values.previewResult) return;

      // Merge provisioning settings into service_attributes
      const serviceAttributes = {
        ...values.previewResult.service_attributes,
        ...(values.flavor_exclude_regex && {
          flavor_exclude_regex: values.flavor_exclude_regex,
        }),
        ...(values.volume_type_blacklist && {
          volume_type_blacklist: values.volume_type_blacklist,
        }),
        ...(values.console_type && { console_type: values.console_type }),
        ...(values.console_domain_override && {
          console_domain_override: values.console_domain_override,
        }),
        ...(values.dns_nameservers?.length && {
          dns_nameservers: values.dns_nameservers,
        }),
        create_ha_routers: values.create_ha_routers,
        live_resize_of_volumes_enabled: values.live_resize_of_volumes_enabled,
        ...(values.max_concurrent_provision_instance != null && {
          max_concurrent_provision_instance:
            values.max_concurrent_provision_instance,
        }),
        ...(values.max_concurrent_provision_volume != null && {
          max_concurrent_provision_volume:
            values.max_concurrent_provision_volume,
        }),
        ...(values.max_concurrent_provision_snapshot != null && {
          max_concurrent_provision_snapshot:
            values.max_concurrent_provision_snapshot,
        }),
      };

      // Merge limits into plugin_options
      const pluginOptions = {
        ...values.previewResult.plugin_options,
        ...(values.default_internal_network_mtu != null && {
          default_internal_network_mtu: values.default_internal_network_mtu,
        }),
        ...(values.snapshot_size_limit_gb != null && {
          snapshot_size_limit_gb: values.snapshot_size_limit_gb,
        }),
        ...(values.max_instances != null && {
          max_instances: values.max_instances,
        }),
        ...(values.max_volumes != null && {
          max_volumes: values.max_volumes,
        }),
      };

      return await marketplaceProviderOfferingsUpdateIntegration({
        path: { uuid: props.offering.uuid },
        body: {
          service_attributes: serviceAttributes,
          plugin_options: pluginOptions,
        },
      });
    },

    successMessage: translate('OpenStack configuration applied successfully.'),
    errorMessage: translate('Failed to apply OpenStack configuration.'),
    refetch: props.refetch,

    invalidateQueries: [
      {
        queryKey: ['OfferingDetails'],
      },
    ],
  });

  const renderFooter = () => (
    <>
      <BaseButton
        variant="tertiary"
        className="min-w-[var(--dialog-action-min-w)] me-auto"
        onClick={() => props.onPrev(values)}
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        size="lg"
      />
      <CloseDialogButton />
      <SubmitButton
        submitting={applyMutation.isPending}
        disabled={loading || !!previewError || !values.previewResult}
        label={translate('Apply Configuration')}
        onClick={() => applyMutation.mutate()}
        data-testid="discovery-apply-btn"
      />
    </>
  );

  if (loading) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <StepLoading message={translate('Generating service attributes...')} />
      </WizardModal>
    );
  }

  if (previewError) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <AlertItem type="floating" variant="error" title={previewError} />
      </WizardModal>
    );
  }

  const formatValue = (value: unknown): string =>
    typeof value === 'object' && value !== null
      ? JSON.stringify(value, null, 2)
      : String(value);

  const selectedNetwork = values.externalNetworks.find(
    (n) => n.id === values.selectedExternalNetworkId,
  );

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <h4 className="mb-3">{translate('Preview Configuration')}</h4>
      <p className="text-quaternary mb-3">
        {translate(
          'Review the configuration below before applying it to the offering.',
        )}
      </p>

      <PropertyCard bordered title={translate('Connection')} className="mb-3">
        <PropertyList variant="summary" termWidth="md">
          <PropertyItem
            label={translate('Auth URL')}
            value={propVal.code(values.auth_url)}
          />
          <PropertyItem label={translate('Username')} value={values.username} />
          <PropertyItem
            label={translate('User domain')}
            value={values.user_domain_name}
          />
          <PropertyItem
            label={translate('Project')}
            value={values.project_name}
          />
        </PropertyList>
      </PropertyCard>

      <PropertyCard
        bordered
        title={translate('Selected Infrastructure')}
        className="mb-3"
      >
        <PropertyList variant="summary" termWidth="md" hideIfEmpty={false}>
          <PropertyItem
            label={translate('External network')}
            value={selectedNetwork?.name}
          />
          <PropertyItem
            label={translate('Instance availability zone')}
            value={values.selectedInstanceAZ}
          />
          <PropertyItem
            label={translate('Volume availability zone')}
            value={values.selectedVolumeAZ}
          />
        </PropertyList>
      </PropertyCard>

      {(values.flavor_exclude_regex ||
        values.volume_type_blacklist ||
        values.console_type ||
        values.console_domain_override ||
        values.dns_nameservers?.length ||
        values.create_ha_routers ||
        values.live_resize_of_volumes_enabled ||
        values.max_concurrent_provision_instance != null ||
        values.max_concurrent_provision_volume != null ||
        values.max_concurrent_provision_snapshot != null) && (
        <PropertyCard
          bordered
          title={translate('Provisioning')}
          className="mb-3"
        >
          <PropertyList variant="summary" termWidth="md">
            <PropertyItem
              label={translate('Flavor exclude regex')}
              value={propVal.code(values.flavor_exclude_regex)}
            />
            <PropertyItem
              label={translate('Blacklisted volume types')}
              value={values.volume_type_blacklist}
            />
            <PropertyItem
              label={translate('Console type')}
              value={values.console_type}
            />
            <PropertyItem
              label={translate('Console domain override')}
              value={values.console_domain_override}
            />
            <PropertyItem
              label={translate('DNS nameservers')}
              value={propVal.list(values.dns_nameservers)}
            />
            <PropertyItem
              label={translate('HA routers')}
              value={values.create_ha_routers ? translate('Enabled') : null}
            />
            <PropertyItem
              label={translate('Live volume resize')}
              value={
                values.live_resize_of_volumes_enabled
                  ? translate('Enabled')
                  : null
              }
            />
            <PropertyItem
              label={translate('Max concurrent (instances)')}
              value={values.max_concurrent_provision_instance}
            />
            <PropertyItem
              label={translate('Max concurrent (volumes)')}
              value={values.max_concurrent_provision_volume}
            />
            <PropertyItem
              label={translate('Max concurrent (snapshots)')}
              value={values.max_concurrent_provision_snapshot}
            />
          </PropertyList>
        </PropertyCard>
      )}

      {(values.default_internal_network_mtu != null ||
        values.snapshot_size_limit_gb != null ||
        values.max_instances != null ||
        values.max_volumes != null) && (
        <PropertyCard bordered title={translate('Limits')} className="mb-3">
          <PropertyList variant="summary" termWidth="md">
            <PropertyItem
              label={translate('Default internal network MTU')}
              value={values.default_internal_network_mtu}
            />
            <PropertyItem
              label={translate('Snapshot size limit')}
              value={propVal.number(values.snapshot_size_limit_gb, {
                unit: 'GB',
              })}
            />
            <PropertyItem
              label={translate('Max instances per tenant')}
              value={values.max_instances}
            />
            <PropertyItem
              label={translate('Max volumes per tenant')}
              value={values.max_volumes}
            />
          </PropertyList>
        </PropertyCard>
      )}

      {values.previewResult && (
        <>
          <PropertyCard
            bordered
            title={translate('Service Attributes')}
            className="mb-3"
          >
            <PropertyList variant="summary" termWidth="md">
              {Object.entries(values.previewResult.service_attributes).map(
                ([key, value]) => (
                  <PropertyItem
                    key={key}
                    label={<Code>{key}</Code>}
                    value={propVal.code(formatValue(value))}
                  />
                ),
              )}
            </PropertyList>
          </PropertyCard>

          <PropertyCard
            bordered
            title={translate('Plugin Options')}
            className="mb-3"
          >
            {Object.keys(values.previewResult.plugin_options).length > 0 ? (
              <PropertyList variant="summary" termWidth="md">
                {Object.entries(values.previewResult.plugin_options).map(
                  ([key, value]) => (
                    <PropertyItem
                      key={key}
                      label={<Code>{key}</Code>}
                      value={propVal.code(formatValue(value))}
                      hasCopy
                    />
                  ),
                )}
              </PropertyList>
            ) : (
              <span className="text-quaternary">
                {translate('No plugin options')}
              </span>
            )}
          </PropertyCard>
        </>
      )}
    </WizardModal>
  );
};
