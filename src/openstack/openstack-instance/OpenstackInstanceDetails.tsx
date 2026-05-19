import { useAsync } from 'react-use';
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

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getUUID } from '@/core/utils';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { OrderDetailsProps } from '@/marketplace/types';
import {
  formatSubnet,
  formatVolumeTypeLabel,
  getDefaultFloatingIps,
} from '@/openstack/openstack-instance/utils';
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
    loading,
    error,
    value: attributesData,
  } = useAsync(() => loadData(attributes));

  if (loading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load offering details.')}</>;

  return (
    <>
      {attributesData?.image && (
        <FormTable.Item label={translate('Image')}>
          {attributesData.image.name}
        </FormTable.Item>
      )}
      {attributesData?.flavor && (
        <FormTable.Item label={translate('Flavor')}>
          {formatFlavor(attributesData.flavor)}
        </FormTable.Item>
      )}
      {attributesData?.availabilityZone && (
        <FormTable.Item label={translate('Availability zone')}>
          {attributesData.availabilityZone.name}
        </FormTable.Item>
      )}
      {typeof attributes['system_volume_size'] === 'number' && (
        <FormTable.Item label={translate('System volume size')}>
          {attributes['system_volume_size'] / 1024} GB
        </FormTable.Item>
      )}
      {attributesData?.systemVolumeType && (
        <FormTable.Item label={translate('System volume type')}>
          {formatVolumeTypeLabel(attributesData.systemVolumeType)}
        </FormTable.Item>
      )}
      {typeof attributes['data_volume_size'] === 'number' && (
        <FormTable.Item label={translate('Data volume size')}>
          {attributes['data_volume_size'] / 1024} GB
        </FormTable.Item>
      )}
      {attributesData?.dataVolumeType && (
        <FormTable.Item label={translate('Data volume type')}>
          {formatVolumeTypeLabel(attributesData.dataVolumeType)}
        </FormTable.Item>
      )}
      {attributesData?.publicKey && (
        <FormTable.Item label={translate('SSH public key')}>
          {attributesData.publicKey.name}
        </FormTable.Item>
      )}
      {attributesData?.securityGroups && (
        <FormTable.Item label={translate('Security groups')}>
          {attributesData.securityGroups.map((securityGroup, index) => (
            <p key={index}>{securityGroup.name}</p>
          ))}
        </FormTable.Item>
      )}
      {attributesData?.networks && (
        <FormTable.Item label={translate('Networks')}>
          {attributesData.networks.map((network, index) => (
            <p key={index}>
              {formatSubnet(network.subnet)}
              <br />
              {network.floatingIp.address}
            </p>
          ))}
        </FormTable.Item>
      )}
      {typeof attributes['user_data'] == 'string' && (
        <FormTable.Item label={translate('User data')}>
          <pre>{attributes['user_data']}</pre>
        </FormTable.Item>
      )}
      {typeof attributes['config_drive'] === 'boolean' && (
        <FormTable.Item label={translate('Config drive')}>
          {attributes['config_drive']
            ? translate('Enabled')
            : translate('Disabled')}
        </FormTable.Item>
      )}
    </>
  );
};
