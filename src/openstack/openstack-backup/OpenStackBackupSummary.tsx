import { getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  ResourceSummaryBase,
} from '@waldur/resource/summary';

const formatInstance = (props) => (
  <ResourceLink
    type="OpenStackTenant.Instance"
    uuid={getUUID(props.instance)}
    project={props.project_uuid}
    label={props.instance_name}
  />
);

export const OpenStackBackupSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  return (
    <span>
      <ResourceSummaryBase {...props} />
      <Field label={translate('Instance')} value={formatInstance(resource)} />
    </span>
  );
};
