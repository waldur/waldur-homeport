import { formatFilesize, getUUID } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import {
  Field,
  ResourceSummaryProps,
  ResourceSummaryBase,
} from '@waldur/resource/summary';

import { INSTANCE_TYPE } from '../constants';

const formatSize = (props) => {
  const filesize = formatFilesize(props.resource.size);
  return props.resource.bootable
    ? `${translate('bootable')} ${filesize}`
    : filesize;
};

const formatInstance = (props) =>
  props.resource.instance ? (
    <ResourceLink
      type={INSTANCE_TYPE}
      uuid={getUUID(props.resource.instance)}
      project={props.resource.project_uuid}
      label={props.resource.instance_name}
    />
  ) : (
    <>&ndash;</>
  );

export const OpenStackVolumeSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  return (
    <span>
      <ResourceSummaryBase {...props} />
      <Field label={translate('Size')} value={formatSize(props)} />
      <Field label={translate('Attached to')} value={formatInstance(props)} />
      <Field label={translate('Device')} value={resource.device} />
      <Field
        label={translate('Availability zone')}
        value={resource.availability_zone_name}
      />
      <Field label={translate('Volume type')} value={resource.type_name} />
    </span>
  );
};
