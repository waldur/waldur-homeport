import { formatFilesize, getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  ResourceSummaryBase,
} from '@waldur/resource/summary';

const formatVolume = (props) => (
  <ResourceLink
    type="OpenStackTenant.Volume"
    uuid={getUUID(props.source_volume)}
    project={props.project_uuid}
    label={props.source_volume_name}
  />
);

export const OpenStackSnapshotSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  return (
    <span>
      <ResourceSummaryBase {...props} />
      <Field label={translate('Size')} value={formatFilesize(resource.size)} />
      <Field label={translate('Volume')} value={formatVolume(resource)} />
    </span>
  );
};
