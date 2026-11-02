import type { OpenStackSubNet } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { formatAllocationPool } from '@/openstack/openstack-network/utils';
import { propVal } from '@/property/propertyFields';
import { ResourceSummaryProps } from '@/resource/summary';

import { getIpv6ModeOptions } from './ipv6Modes';

export const OpenStackSubNetSummary = (
  props: ResourceSummaryProps<OpenStackSubNet>,
) => {
  const { resource } = props;
  return (
    <>
      <PropertyItem
        label={translate('Network')}
        value={resource.network_name}
      />
      <PropertyItem label={translate('Router')} value={resource.router_name} />
      <PropertyItem
        label={translate('CIDR')}
        value={resource.cidr}
        valueClass="ellipsis"
        hasCopy
      />

      <PropertyItem
        label={translate('Allocation pools')}
        value={formatAllocationPool(resource.allocation_pools)}
        valueClass="ellipsis"
      />

      <PropertyItem
        label={translate('Gateway IP')}
        value={resource.gateway_ip}
        hasCopy
      />
      <PropertyItem
        label={translate('Backend ID')}
        value={resource.backend_id}
        hasCopy
      />
      <PropertyItem
        label={translate('Enabled default gateway')}
        value={propVal.boolean(resource.is_connected)}
      />

      <PropertyItem
        label={translate('IP version')}
        value={resource.ip_version}
      />

      {resource.ip_version === 6 && (
        <>
          <PropertyItem
            label={translate('IPv6 router advertisement mode')}
            value={propVal.enum(resource.ipv6_ra_mode, {
              options: getIpv6ModeOptions(),
            })}
            placeholder="none"
          />
          <PropertyItem
            label={translate('IPv6 address mode')}
            value={propVal.enum(resource.ipv6_address_mode, {
              options: getIpv6ModeOptions(),
            })}
            placeholder="none"
          />
        </>
      )}

      <PropertyItem
        label={translate('Enable DHCP')}
        value={propVal.boolean(resource.enable_dhcp)}
      />
    </>
  );
};
