import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  ResourceSummaryBase,
} from '@waldur/resource/summary';

const formatTenant = (props) => (
  <ResourceLink
    type="OpenStack.Tenant"
    uuid={props.tenant_uuid}
    project={props.project_uuid}
    label={props.tenant_name}
  />
);

export const OpenStackFloatingIpSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  return (
    <span>
      <ResourceSummaryBase {...props} />
      <Field label={translate('Tenant')} value={formatTenant(props.resource)} />
      <Field label={translate('Address')} value={resource.address} />
      <Field
        label={translate('Runtime state')}
        value={resource.runtime_state}
      />
    </span>
  );
};
