import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { formatAllocationPool } from '@/openstack/openstack-network/utils';
import { Field, ResourceSummaryProps } from '@/resource/summary';
import { formatDefault } from '@/resource/utils';
import { renderFieldOrDash } from '@/table/utils';

export const OpenStackSubNetSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component label={translate('Network')} value={resource.network_name} />
      <Component
        label={translate('CIDR')}
        value={formatDefault(resource.cidr)}
        valueClass="ellipsis"
        hasCopy={!!formatDefault(resource.cidr)}
      />

      <Component
        label={translate('Allocation pools')}
        value={formatAllocationPool(resource.allocation_pools)}
        valueClass="ellipsis"
      />

      <Component
        label={translate('Gateway IP')}
        value={formatDefault(resource.gateway_ip)}
        hasCopy={!!resource.gateway_ip}
      />
      <Component
        label={translate('Backend ID')}
        value={renderFieldOrDash(resource.backend_id)}
        hasCopy={!!resource.backend_id}
      />
      <Component
        label={translate('Enabled default gateway')}
        value={resource.is_connected ? translate('Yes') : translate('No')}
      />

      <Component
        label={translate('IP version')}
        value={formatDefault(resource.ip_version)}
      />

      <Component
        label={translate('Enable DHCP')}
        value={resource.enable_dhcp ? translate('Yes') : translate('No')}
      />
    </>
  );
};
