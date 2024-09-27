import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

const formatSize = (props) => {
  const filesize = formatFilesize(props.resource.size);
  return props.resource.bootable
    ? `${translate('bootable')} ${filesize}`
    : filesize;
};

export const formatInstance = (resource) =>
  resource.instance_marketplace_uuid ? (
    <ResourceLink
      uuid={resource.instance_marketplace_uuid}
      label={resource.instance_name}
    />
  ) : (
    <>&ndash;</>
  );

export const OpenStackVolumeSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  return (
    <>
      <Field label={translate('Size')} value={formatSize(props)} />
      <Field
        label={translate('Attached to')}
        value={formatInstance(props.resource)}
      />
      <Field label={translate('Device')} value={resource.device} />
      <Field
        label={translate('Availability zone')}
        value={resource.availability_zone_name}
      />
      <Field label={translate('Volume type')} value={resource.type_name} />
    </>
  );
};
