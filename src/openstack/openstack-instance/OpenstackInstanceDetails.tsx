import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { DetailsField } from '@waldur/marketplace/common/DetailsField';
import { OrderDetailsProps } from '@waldur/marketplace/types';
import { getDefaultFloatingIps } from '@waldur/openstack/openstack-instance/OpenstackInstanceNetworks';
import { FloatingIp } from '@waldur/openstack/openstack-instance/types';
import {
  formatSubnet,
  formatVolumeTypeLabel,
} from '@waldur/openstack/openstack-instance/utils';
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
    if (attributes.internal_ips_set) {
      try {
        const networksMap = {};
        attributes.internal_ips_set.map((item) => {
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
        <DetailsField label={translate('Image')}>
          {attributesData.image.name}
        </DetailsField>
      )}
      {attributesData?.flavor && (
        <DetailsField label={translate('Flavor')}>
          {formatFlavor(attributesData.flavor)}
        </DetailsField>
      )}
      {attributesData?.availabilityZone && (
        <DetailsField label={translate('Availability zone')}>
          {attributesData.availabilityZone.name}
        </DetailsField>
      )}
      {attributes.system_volume_size && (
        <DetailsField label={translate('System volume size')}>
          {attributes.system_volume_size / 1024} GB
        </DetailsField>
      )}
      {attributesData?.systemVolumeType && (
        <DetailsField label={translate('System volume type')}>
          {formatVolumeTypeLabel(attributesData.systemVolumeType)}
        </DetailsField>
      )}
      {attributes.data_volume_size && (
        <DetailsField label={translate('Data volume size')}>
          {attributes.data_volume_size / 1024} GB
        </DetailsField>
      )}
      {attributesData?.dataVolumeType && (
        <DetailsField label={translate('Data volume type')}>
          {formatVolumeTypeLabel(attributesData.dataVolumeType)}
        </DetailsField>
      )}
      {attributesData?.publicKey && (
        <DetailsField label={translate('SSH public key')}>
          {attributesData.publicKey.name}
        </DetailsField>
      )}
      {attributesData?.securityGroups && (
        <DetailsField label={translate('Security groups')}>
          {attributesData.securityGroups.map((securityGroup, index) => (
            <p key={index}>{securityGroup.name}</p>
          ))}
        </DetailsField>
      )}
      {attributesData?.networks && (
        <DetailsField label={translate('Networks')}>
          {attributesData.networks.map((network, index) => (
            <p key={index}>
              {network.subnet.label}
              <br />
              {network.floatingIp.address}
            </p>
          ))}
        </DetailsField>
      )}
      {attributes.user_data && (
        <DetailsField label={translate('User data')}>
          <pre>{attributes.user_data}</pre>
        </DetailsField>
      )}
    </>
  );
};
