import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

const formatTenant = (props) => (
  <ResourceLink
    type="OpenStack.Tenant"
    uuid={props.tenant_uuid}
    project={props.project_uuid}
    label={props.tenant_name}
  />
);

export const OpenStackSecurityGroupSummary = (props: ResourceSummaryProps) => {
  return (
    <Field label={translate('Tenant')} value={formatTenant(props.resource)} />
  );
};
