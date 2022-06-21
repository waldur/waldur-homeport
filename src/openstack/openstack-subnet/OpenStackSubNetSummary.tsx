import { getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { formatAllocationPool } from '@waldur/openstack/openstack-network/utils';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  ResourceSummaryBase,
} from '@waldur/resource/summary';
import { formatDefault } from '@waldur/resource/utils';

const formatNetwork = (props) => (
  <ResourceLink
    type="OpenStack.Network"
    uuid={getUUID(props.network)}
    project={props.project_uuid}
    label={props.network_name}
  />
);

const formatTenant = (props) => (
  <ResourceLink
    type="OpenStack.Tenant"
    uuid={getUUID(props.tenant)}
    project={props.project_uuid}
    label={props.tenant_name}
  />
);

export const OpenStackSubNetSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  return (
    <span>
      <ResourceSummaryBase {...props} />
      <Field label={translate('Tenant')} value={formatTenant(props.resource)} />
      <Field
        label={translate('Network')}
        value={formatNetwork(props.resource)}
      />
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
    </span>
  );
};
