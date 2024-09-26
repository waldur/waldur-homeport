import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OrderDetailsProps } from '@waldur/marketplace/types';
import { FloatingIp } from '@waldur/openstack/openstack-instance/types';
import {
  formatSubnet,
  formatVolumeTypeLabel,
  getDefaultFloatingIps,
} from '@waldur/openstack/openstack-instance/utils';
import { Field } from '@waldur/resource/summary';
import { formatFlavor, getData } from '@waldur/resource/utils';

export const OpenstackInstanceDetails = (props: OrderDetailsProps) => {
  const {
    order: { attributes: attributes },
  } = props;

  if (!attributes) return null;

  const loadData = async (attributes) => {
    let availabilityZone,
      dataVolumeType,
      flavor,
      image,
      publicKey,
      systemVolumeType,
      networks,
      securityGroups;
    if (attributes.availability_zone) {
      availabilityZone = await getData(attributes.availability_zone);
    }
    if (attributes.data_volume_type) {
      dataVolumeType = await getData(attributes.data_volume_type);
    }
    if (attributes.flavor) {
      flavor = await getData(attributes.flavor);
    }
    if (attributes.image) {
      image = await getData(attributes.image);
    }
    if (attributes.ssh_public_key) {
      publicKey = await getData(attributes.ssh_public_key);
    }
    if (attributes.system_volume_type) {
      systemVolumeType = await getData(attributes.system_volume_type);
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
            const subnet = await get(key).then((response) => response.data);
            const value = networksMap[key];
            let floatingIp = defaults.find((s) => s.url === value);
            if (value !== 'true' && value !== 'false')
              floatingIp = await get<FloatingIp>(value).then(
                (response) => response.data,
              );
            return {
              subnet: {
                ...subnet,
                label: formatSubnet(subnet),
              },
              floatingIp,
            };
          }),
        );
      } catch (e) {
        networks = null;
      }
    }
    if (attributes.security_groups) {
      try {
        securityGroups = await Promise.all(
          attributes.security_groups.map(async (item) => {
            return await get(item.url).then((response) => response.data);
          }),
        );
      } catch (e) {
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
      {attributes.system_volume_size && (
        <Field label={translate('System volume size')}>
          {attributes.system_volume_size / 1024} GB
        </Field>
      )}
      {attributesData?.systemVolumeType && (
        <Field label={translate('System volume type')}>
          {formatVolumeTypeLabel(attributesData.systemVolumeType)}
        </Field>
      )}
      {attributes.data_volume_size && (
        <Field label={translate('Data volume size')}>
          {attributes.data_volume_size / 1024} GB
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
              {network.subnet.label}
              <br />
              {network.floatingIp.address}
            </p>
          ))}
        </Field>
      )}
      {attributes.user_data && (
        <Field label={translate('User data')}>
          <pre>{attributes.user_data}</pre>
        </Field>
      )}
    </>
  );
};
