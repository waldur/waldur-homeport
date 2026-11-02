import { useQuery } from '@tanstack/react-query';
import {
  keysRetrieve,
  OpenStackFlavor,
  openstackFlavorsRetrieve,
  OpenStackFloatingIp,
  openstackFloatingIpsRetrieve,
  OpenStackImage,
  openstackImagesRetrieve,
  OpenStackInstanceAvailabilityZone,
  openstackInstanceAvailabilityZonesRetrieve,
  OpenStackSecurityGroup,
  openstackSecurityGroupsRetrieve,
  OpenStackSubNet,
  openstackSubnetsRetrieve,
  OpenStackVolumeType,
  openstackVolumeTypesRetrieve,
  SshKey,
} from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { OrderDetailsProps } from '@/marketplace/types';
import {
  formatSubnet,
  formatVolumeTypeLabel,
  getDefaultFloatingIps,
} from '@/openstack/openstack-instance/utils';
import { propVal } from '@/property/propertyFields';
import { formatFlavor } from '@/resource/utils';

export const OpenstackInstanceDetails = (props: OrderDetailsProps) => {
  const {
    order: { attributes },
  } = props;

  if (!attributes) return null;

  const loadData = async (attributes) => {
    let availabilityZone: OpenStackInstanceAvailabilityZone,
      dataVolumeType: OpenStackVolumeType,
      flavor: OpenStackFlavor,
      image: OpenStackImage,
      publicKey: SshKey,
      systemVolumeType: OpenStackVolumeType,
      networks: Array<{
        subnet: OpenStackSubNet;
        floatingIp: OpenStackFloatingIp;
      }>,
      securityGroups: OpenStackSecurityGroup[];
    if (attributes.availability_zone) {
      availabilityZone = await openstackInstanceAvailabilityZonesRetrieve({
        path: { uuid: getUUID(attributes.availability_zone) },
      }).then((r) => r.data);
    }
    if (attributes.data_volume_type) {
      dataVolumeType = await openstackVolumeTypesRetrieve({
        path: { uuid: getUUID(attributes.data_volume_type) },
      }).then((r) => r.data);
    }
    if (attributes.flavor) {
      flavor = await openstackFlavorsRetrieve({
        path: { uuid: getUUID(attributes.flavor) },
      }).then((r) => r.data);
    }
    if (attributes.image) {
      image = await openstackImagesRetrieve({
        path: { uuid: getUUID(attributes.image) },
      }).then((r) => r.data);
    }
    if (attributes.ssh_public_key) {
      publicKey = await keysRetrieve({
        path: { uuid: getUUID(attributes.ssh_public_key) },
      }).then((r) => r.data);
    }
    if (attributes.system_volume_type) {
      systemVolumeType = await openstackVolumeTypesRetrieve({
        path: { uuid: getUUID(attributes.system_volume_type) },
      }).then((r) => r.data);
    }
    if (attributes.ports) {
      try {
        const networksMap = {};
        attributes.ports.map((item) => {
          networksMap[item.subnet] = 'false';
        });
        if (attributes.floating_ips) {
          attributes.floating_ips.map((item) => {
            networksMap[item.subnet] = item.url || 'true';
          });
        }
        const defaults = getDefaultFloatingIps();
        networks = await Promise.all(
          Object.keys(networksMap).map(async (key) => {
            const subnet = await openstackSubnetsRetrieve({
              path: { uuid: getUUID(key) },
            }).then((response) => response.data);
            const value = networksMap[key];
            let floatingIp = defaults.find((s) => s.url === value);
            if (value !== 'true' && value !== 'false')
              floatingIp = await openstackFloatingIpsRetrieve({
                path: { uuid: getUUID(value) },
              }).then((response) => response.data);
            return {
              subnet,
              floatingIp,
            };
          }),
        );
      } catch {
        networks = null;
      }
    }
    if (attributes.security_groups) {
      try {
        securityGroups = await Promise.all(
          attributes.security_groups.map((item) =>
            openstackSecurityGroupsRetrieve({
              path: { uuid: getUUID(item.url) },
            }).then((response) => response.data),
          ),
        );
      } catch {
        securityGroups = null;
      }
    }
    return {
      availabilityZone,
      dataVolumeType,
      flavor,
      image,
      publicKey,
      systemVolumeType,
      networks,
      securityGroups,
    };
  };
  const {
    isLoading: loading,
    error,
    data: attributesData,
  } = useQuery({
    queryKey: ['OpenstackInstanceDetails'],
    queryFn: () => loadData(attributes),
  });

  if (loading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load offering details.')}</>;

  return (
    <>
      {attributesData?.image && (
        <PropertyItem
          label={translate('Image')}
          value={attributesData.image.name}
        />
      )}
      {attributesData?.flavor && (
        <PropertyItem label={translate('Flavor')}>
          {formatFlavor(attributesData.flavor)}
        </PropertyItem>
      )}
      {attributesData?.availabilityZone && (
        <PropertyItem
          label={translate('Availability zone')}
          value={attributesData.availabilityZone.name}
        />
      )}
      {typeof attributes['system_volume_size'] === 'number' && (
        <PropertyItem
          label={translate('System volume size')}
          value={propVal.number(attributes['system_volume_size'] / 1024, {
            unit: 'GB',
          })}
        />
      )}
      {attributesData?.systemVolumeType && (
        <PropertyItem
          label={translate('System volume type')}
          value={formatVolumeTypeLabel(attributesData.systemVolumeType)}
        />
      )}
      {typeof attributes['data_volume_size'] === 'number' && (
        <PropertyItem
          label={translate('Data volume size')}
          value={propVal.number(attributes['data_volume_size'] / 1024, {
            unit: 'GB',
          })}
        />
      )}
      {attributesData?.dataVolumeType && (
        <PropertyItem
          label={translate('Data volume type')}
          value={formatVolumeTypeLabel(attributesData.dataVolumeType)}
        />
      )}
      {attributesData?.publicKey && (
        <PropertyItem
          label={translate('SSH public key')}
          value={attributesData.publicKey.name}
        />
      )}
      {attributesData?.securityGroups && (
        <PropertyItem
          label={translate('Security groups')}
          value={propVal.list(
            attributesData.securityGroups.map(
              (securityGroup) => securityGroup.name,
            ),
            { display: 'stack' },
          )}
        />
      )}
      {attributesData?.networks && (
        <PropertyItem label={translate('Networks')}>
          {attributesData.networks.map((network, index) => (
            <p key={index}>
              {formatSubnet(network.subnet)}
              <br />
              {network.floatingIp.address}
            </p>
          ))}
        </PropertyItem>
      )}
      {typeof attributes['user_data'] === 'string' && (
        <PropertyItem label={translate('User data')}>
          <pre className="font-mono text-xs whitespace-pre-wrap m-0">
            {attributes['user_data']}
          </pre>
        </PropertyItem>
      )}
      {typeof attributes['config_drive'] === 'boolean' && (
        <PropertyItem
          label={translate('Config drive')}
          value={propVal.boolean(attributes['config_drive'] as boolean, {
            wording: 'enabled',
          })}
        />
      )}
    </>
  );
};
