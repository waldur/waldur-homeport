import type { OpenStackVolume } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { ResourceLink } from '@/resource/ResourceLink';
import { ResourceSummaryProps } from '@/resource/summary';

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

export const OpenStackVolumeSummary = (
  props: ResourceSummaryProps<OpenStackVolume>,
) => {
  const { resource } = props;
  return (
    <>
      <PropertyItem label={translate('Size')} value={formatSize(props)} />
      <PropertyItem
        label={translate('Attached to')}
        value={formatInstance(props.resource)}
      />

      <PropertyItem label={translate('Device')} value={resource.device} />
      <PropertyItem
        label={translate('Availability zone')}
        value={resource.availability_zone_name}
      />

      <PropertyItem
        label={translate('Volume type')}
        value={resource.type_name}
      />
    </>
  );
};
