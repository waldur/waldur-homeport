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

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { OrderDetailsProps } from '@waldur/marketplace/types';
import {
  formatSubnet,
  formatVolumeTypeLabel,
  getDefaultFloatingIps,
} from '@waldur/openstack/openstack-instance/utils';
import { Field } from '@waldur/resource/summary';
import { formatFlavor } from '@waldur/resource/utils';

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
        <Field label={translate('Image')}>{attributesData.image.name}</Field>
      )}
      {attributesData?.flavor && (
        <Field label={translate('Flavor')}>
          {formatFlavor(attributesData.flavor)}
        </Field>
      )}
      {attributesData?.availabilityZone && (
        <Field label={translate('Availability zone')}>
          {attributesData.availabilityZone.name}
        </Field>
      )}
      {typeof attributes['system_volume_size'] === 'number' && (
        <Field label={translate('System volume size')}>
          {attributes['system_volume_size'] / 1024} GB
        </Field>
      )}
      {attributesData?.systemVolumeType && (
        <Field label={translate('System volume type')}>
          {formatVolumeTypeLabel(attributesData.systemVolumeType)}
        </Field>
      )}
      {typeof attributes['data_volume_size'] === 'number' && (
        <Field label={translate('Data volume size')}>
          {attributes['data_volume_size'] / 1024} GB
        </Field>
      )}
      {attributesData?.dataVolumeType && (
        <Field label={translate('Data volume type')}>
          {formatVolumeTypeLabel(attributesData.dataVolumeType)}
        </Field>
      )}
      {attributesData?.publicKey && (
        <Field label={translate('SSH public key')}>
          {attributesData.publicKey.name}
        </Field>
      )}
      {attributesData?.securityGroups && (
        <Field label={translate('Security groups')}>
          {attributesData.securityGroups.map((securityGroup, index) => (
            <p key={index}>{securityGroup.name}</p>
          ))}
        </Field>
      )}
      {attributesData?.networks && (
        <Field label={translate('Networks')}>
          {attributesData.networks.map((network, index) => (
            <p key={index}>
              {formatSubnet(network.subnet)}
              <br />
              {network.floatingIp.address}
            </p>
          ))}
        </Field>
      )}
      {typeof attributes['user_data'] == 'string' && (
        <Field label={translate('User data')}>
          <pre>{attributes['user_data']}</pre>
        </Field>
      )}
    </>
  );
};
