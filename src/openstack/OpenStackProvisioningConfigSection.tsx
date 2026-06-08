import { FC } from 'react';

import { EditSchedulesButton } from '@/booking/EditSchedulesButton';
import {
  BooleanEditField,
  CommaSeparatedListEditField,
  EditFieldProvider,
  NumberEditField,
  StringEditField,
  withEditField,
} from '@/form/editFields';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';
import { GoogleCalendarActions } from '@/marketplace/offerings/update/integration/GoogleCalendarActions';
import { RemoteActions } from '@/marketplace/offerings/update/integration/RemoteActions';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';
import { useUpdateOfferingIntegration } from '@/marketplace/offerings/update/integration/utils';

import { OpenStackExternalIpsField } from './OpenStackExternalIpsField';

const ExternalIpsEditField = withEditField(OpenStackExternalIpsField);

export const OpenStackProvisioningConfigSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  const showSnapshotLimit =
    props.offering.plugin_options?.storage_mode == 'dynamic';

  return (
    <EditFieldProvider scope={props.offering} callback={update}>
      <TabbedSection
        title={translate('Provisioning configuration')}
        actions={
          <>
            <EditSchedulesButton {...props} />
            <RemoteActions offering={props.offering} />
            <GoogleCalendarActions offering={props.offering} />
          </>
        }
      >
        <TabbedSection.Tab id="filtering" title={translate('Filtering')}>
          <StringEditField
            name="service_attributes.availability_zone"
            label={translate('Availability zone')}
            description={translate(
              'Default availability zone for provisioned instances.',
            )}
          />
          <StringEditField
            name="service_attributes.flavor_exclude_regex"
            label={translate('Flavor exclude regex')}
            description={translate(
              'Flavors matching this regex expression will not be pulled from the backend.',
            )}
          />
          <StringEditField
            name="service_attributes.volume_type_blacklist"
            label={translate('Blacklisted volume types')}
            description={translate(
              'List of comma-separated volume types which should not be possible to select when creating VM/Volume.',
            )}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="console" title={translate('Console access')}>
          <StringEditField
            name="service_attributes.console_type"
            label={translate('Console type')}
            description={translate(
              'Type of console access protocol used by OpenStack (novnc, xvpvnc, spice-html5, rdp-html5, serial). Default: novnc.',
            )}
          />
          <StringEditField
            name="service_attributes.console_domain_override"
            label={translate('Console domain override')}
            description={translate(
              'A client-accessible domain name override in case OpenStack is returning an internal domain. Leave empty to use the domain returned by OpenStack.',
            )}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="network" title={translate('Network')}>
          <BooleanEditField
            name="plugin_options.lbaas_enabled"
            label={translate('Enable LBaaS')}
            description={translate(
              'Enable Load Balancer as a Service (Octavia) for this offering. When enabled, the Load balancers tab will be visible in the VPC Networking section.',
            )}
          />
          <CommaSeparatedListEditField
            name="service_attributes.dns_nameservers"
            label={translate('Default DNS servers')}
            description={translate(
              'Default value for new subnets DNS name servers. Should be defined as list.',
            )}
          />
          <BooleanEditField
            name="service_attributes.create_ha_routers"
            label={translate('Create highly available Neutron routers')}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="operations" title={translate('Operations')}>
          <BooleanEditField
            name="service_attributes.config_drive"
            label={translate('Config drive enabled by default')}
            description={translate(
              'A config drive is a small read-only disk attached to the instance at boot, used by cloud-init to deliver metadata, SSH keys and user data without going through the network metadata service (http://169.254.169.254). Enable this when guests cannot reach the metadata service — for example, when the tenant network has no DHCP or sits on an isolated segment. Leave it off when the metadata service is reachable, which is the usual case. Users can override per-instance at order time.',
            )}
          />
          <BooleanEditField
            name="service_attributes.live_resize_of_volumes_enabled"
            label={translate('Allow live volume resize')}
            description={translate(
              'Allow live volume resize of system and data volumes.',
            )}
          />
          <NumberEditField
            name="service_attributes.max_concurrent_provision_instance"
            label={translate(
              'Maximum parallel executions of provisioning operations for instances',
            )}
            description={translate('Leave empty for unlimited.')}
          />
          <NumberEditField
            name="service_attributes.max_concurrent_provision_volume"
            label={translate(
              'Maximum parallel executions of provisioning operations for volumes',
            )}
            description={translate('Leave empty for unlimited.')}
          />
          <NumberEditField
            name="service_attributes.max_concurrent_provision_snapshot"
            label={translate(
              'Maximum parallel executions of provisioning operations for snapshots',
            )}
            description={translate('Leave empty for unlimited.')}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="limits" title={translate('Limits')}>
          <NumberEditField
            name="plugin_options.default_internal_network_mtu"
            label={translate('Default internal network MTU')}
            description={translate(
              'MTU value for internal networks. Valid range: 68–9000. Leave empty to use the cloud default.',
            )}
          />
          {showSnapshotLimit && (
            <NumberEditField
              name="plugin_options.snapshot_size_limit_gb"
              label={translate('Snapshot size limit')}
              description={translate(
                'Additional space to apply to storage quota to be used by snapshots. Leave empty for no limit.',
              )}
              unit="GB"
            />
          )}
          <NumberEditField
            name="plugin_options.max_instances"
            label={translate('Maximum number of instances in a single tenant')}
            description={translate('Leave empty for no limit.')}
          />
          <NumberEditField
            name="plugin_options.max_volumes"
            label={translate('Maximum number of volumes in a single tenant')}
            description={translate('Leave empty for no limit.')}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="ip-mapping" title={translate('IP mapping')}>
          <ExternalIpsEditField
            name="secret_options.ipv4_external_ip_mapping"
            label={translate('Mapping of floating to external IPs')}
            renderValue={(value) =>
              value ? (
                <div className="text-pre">
                  {value
                    .map((item) => `${item.floating_ip}: ${item.external_ip}`)
                    .join('\n')}
                </div>
              ) : (
                'N/A'
              )
            }
          />
        </TabbedSection.Tab>
      </TabbedSection>
    </EditFieldProvider>
  );
};
