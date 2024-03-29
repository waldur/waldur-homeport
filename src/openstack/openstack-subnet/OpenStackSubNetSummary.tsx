import { translate } from '@waldur/i18n';
import { formatAllocationPool } from '@waldur/openstack/openstack-network/utils';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';
import { formatDefault } from '@waldur/resource/utils';

export const OpenStackSubNetSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  return (
    <>
      <Field label={translate('Network')} value={resource.network_name} />
      <Field
        label={translate('CIDR')}
        value={formatDefault(resource.cidr)}
        valueClass="ellipsis"
      />
      <Field
        label={translate('Allocation pools')}
        value={formatAllocationPool(resource.allocation_pools)}
        valueClass="ellipsis"
      />
      <Field
        label={translate('Gateway IP')}
        value={formatDefault(resource.gateway_ip)}
      />
      <Field
        label={translate('Enabled default gateway')}
        value={resource.is_connected ? translate('Yes') : translate('No')}
      />
      <Field
        label={translate('IP version')}
        value={formatDefault(resource.ip_version)}
      />
      <Field
        label={translate('Enable DHCP')}
        value={resource.enable_dhcp ? translate('Yes') : translate('No')}
      />
    </>
  );
};
