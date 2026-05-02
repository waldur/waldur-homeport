import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC, useEffect, useState } from 'react';
import { Alert, Card, Spinner, Table } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  openstackDiscoveryPreviewServiceAttributes,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { renderFieldOrDash } from '@/table/utils';
import { WizardModal, WizardStepProps } from '@/wizard';

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
          service_attributes: serviceAttributes as unknown as Record<
            string,
            string
          >,
          plugin_options: pluginOptions as unknown as Record<string, string>,
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
      <SubmitButton
        submitting={false}
        variant="tertiary"
        className="min-w-125px me-auto"
        onClick={() => props.onPrev(values)}
        type="button"
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        iconOnLeft
      />
      <CloseDialogButton className="min-w-125px" />
      <SubmitButton
        submitting={applyMutation.isPending}
        disabled={loading || !!previewError || !values.previewResult}
        label={translate('Apply Configuration')}
        onClick={() => applyMutation.mutate()}
        type="button"
        data-testid="discovery-apply-btn"
      />
    </>
  );

  if (loading) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <div className="text-center py-10">
          <Spinner animation="border" />
          <p className="mt-4">
            {translate('Generating service attributes...')}
          </p>
        </div>
      </WizardModal>
    );
  }

  if (previewError) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <Alert variant="danger">{previewError}</Alert>
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
      <h4 className="mb-4">{translate('Preview Configuration')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'Review the configuration below before applying it to the offering.',
        )}
      </p>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Connection')}</h5>
        </Card.Header>
        <Card.Body>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td className="text-muted" style={{ width: '40%' }}>
                  {translate('Auth URL')}
                </td>
                <td>
                  <code>{values.auth_url}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Username')}</td>
                <td>{values.username}</td>
              </tr>
              <tr>
                <td className="text-muted">{translate('User domain')}</td>
                <td>{values.user_domain_name}</td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Project')}</td>
                <td>{values.project_name}</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Selected Infrastructure')}</h5>
        </Card.Header>
        <Card.Body>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td className="text-muted" style={{ width: '40%' }}>
                  {translate('External network')}
                </td>
                <td>{renderFieldOrDash(selectedNetwork?.name)}</td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Instance availability zone')}
                </td>
                <td>{renderFieldOrDash(values.selectedInstanceAZ)}</td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Volume availability zone')}
                </td>
                <td>{renderFieldOrDash(values.selectedVolumeAZ)}</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

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
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">{translate('Provisioning')}</h5>
          </Card.Header>
          <Card.Body>
            <Table borderless size="sm">
              <tbody>
                {values.flavor_exclude_regex && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Flavor exclude regex')}
                    </td>
                    <td>
                      <code>{values.flavor_exclude_regex}</code>
                    </td>
                  </tr>
                )}
                {values.volume_type_blacklist && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Blacklisted volume types')}
                    </td>
                    <td>{values.volume_type_blacklist}</td>
                  </tr>
                )}
                {values.console_type && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Console type')}
                    </td>
                    <td>{values.console_type}</td>
                  </tr>
                )}
                {values.console_domain_override && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Console domain override')}
                    </td>
                    <td>{values.console_domain_override}</td>
                  </tr>
                )}
                {values.dns_nameservers?.length > 0 && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('DNS nameservers')}
                    </td>
                    <td>{values.dns_nameservers.join(', ')}</td>
                  </tr>
                )}
                {values.create_ha_routers && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('HA routers')}
                    </td>
                    <td>{translate('Enabled')}</td>
                  </tr>
                )}
                {values.live_resize_of_volumes_enabled && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Live volume resize')}
                    </td>
                    <td>{translate('Enabled')}</td>
                  </tr>
                )}
                {values.max_concurrent_provision_instance != null && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Max concurrent (instances)')}
                    </td>
                    <td>{values.max_concurrent_provision_instance}</td>
                  </tr>
                )}
                {values.max_concurrent_provision_volume != null && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Max concurrent (volumes)')}
                    </td>
                    <td>{values.max_concurrent_provision_volume}</td>
                  </tr>
                )}
                {values.max_concurrent_provision_snapshot != null && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Max concurrent (snapshots)')}
                    </td>
                    <td>{values.max_concurrent_provision_snapshot}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {(values.default_internal_network_mtu != null ||
        values.snapshot_size_limit_gb != null ||
        values.max_instances != null ||
        values.max_volumes != null) && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">{translate('Limits')}</h5>
          </Card.Header>
          <Card.Body>
            <Table borderless size="sm">
              <tbody>
                {values.default_internal_network_mtu != null && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Default internal network MTU')}
                    </td>
                    <td>{values.default_internal_network_mtu}</td>
                  </tr>
                )}
                {values.snapshot_size_limit_gb != null && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Snapshot size limit')}
                    </td>
                    <td>{values.snapshot_size_limit_gb} GB</td>
                  </tr>
                )}
                {values.max_instances != null && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Max instances per tenant')}
                    </td>
                    <td>{values.max_instances}</td>
                  </tr>
                )}
                {values.max_volumes != null && (
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>
                      {translate('Max volumes per tenant')}
                    </td>
                    <td>{values.max_volumes}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {values.previewResult && (
        <>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">{translate('Service Attributes')}</h5>
            </Card.Header>
            <Card.Body>
              <Table borderless size="sm">
                <tbody>
                  {Object.entries(values.previewResult.service_attributes).map(
                    ([key, value]) => (
                      <tr key={key}>
                        <td className="text-muted" style={{ width: '40%' }}>
                          <code>{key}</code>
                        </td>
                        <td>
                          <code>
                            {typeof value === 'object' && value !== null
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </code>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">{translate('Plugin Options')}</h5>
            </Card.Header>
            <Card.Body>
              {Object.keys(values.previewResult.plugin_options).length > 0 ? (
                <Table borderless size="sm">
                  <tbody>
                    {Object.entries(values.previewResult.plugin_options).map(
                      ([key, value]) => (
                        <tr key={key}>
                          <td className="text-muted" style={{ width: '40%' }}>
                            <code>{key}</code>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <code>{formatValue(value)}</code>
                              <CopyToClipboardButton
                                value={formatValue(value)}
                                size={14}
                                onlyButton
                              />
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </Table>
              ) : (
                <span className="text-muted">
                  {translate('No plugin options')}
                </span>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </WizardModal>
  );
};
