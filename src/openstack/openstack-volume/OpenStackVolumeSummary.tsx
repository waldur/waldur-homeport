import { formatFilesize } from '@/core/utils';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { ResourceLink } from '@/resource/ResourceLink';
import { Field, ResourceSummaryProps } from '@/resource/summary';

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
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component label={translate('Size')} value={formatSize(props)} />
      <Component
        label={translate('Attached to')}
        value={formatInstance(props.resource)}
      />

      <Component label={translate('Device')} value={resource.device} />
      <Component
        label={translate('Availability zone')}
        value={resource.availability_zone_name}
      />

      <Component label={translate('Volume type')} value={resource.type_name} />
    </>
  );
};
