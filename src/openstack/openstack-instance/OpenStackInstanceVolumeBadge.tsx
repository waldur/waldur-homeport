import { OpenStackNestedVolume } from 'waldur-js-client';

import { PropertyList, Tooltip } from 'waldur-ui';
import { Badge, PropertyItem } from 'waldur-ui';

import { Link } from '@/core/Link';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import openstackIcon from '@/images/appstore/icon-openstack.png';
import { propVal } from '@/property/propertyFields';

interface VolumeBadgeProps {
  volume: OpenStackNestedVolume;
  resourceName?: string;
}

const VolumeBadgeTipView = ({ volume, resourceName }: VolumeBadgeProps) => {
  return (
    <div className="text-start p-1.5">
      <PropertyList variant="compact" hideIfEmpty>
        <PropertyItem label={translate('Attached to')} value={resourceName} />
        <PropertyItem
          label={translate('Volume type')}
          value={volume.type_name}
        />

        <PropertyItem
          label={translate('Size')}
          value={propVal.fileSize(volume.size, { unit: 'MB' })}
        />

        <PropertyItem
          label={translate('Mount')}
          value={volume.device}
          hasCopy
        />
      </PropertyList>
      {volume.marketplace_resource_uuid && (
        <Link
          state="marketplace-resource-details"
          params={{
            resource_uuid: volume.marketplace_resource_uuid,
          }}
          buttonVariant="secondary"
          buttonSize="sm"
          className="mt-1.5"
        >
          {translate('Go to detail view')}
        </Link>
      )}
    </div>
  );
};

export const OpenStackInstanceVolumeBadge = ({
  volume,
  resourceName,
}: VolumeBadgeProps) => {
  return (
    <Tooltip
      label={<VolumeBadgeTipView volume={volume} resourceName={resourceName} />}
      side="bottom"
      trigger="click"
      autoWidth
    >
      <Badge
        variant="neutral"
        tone="outline"
        className="cursor-pointer me-2.5 mb-1"
      >
        <img
          src={openstackIcon}
          alt="openstack"
          width={15}
          className="me-1.5"
        />
        {volume.name}({formatFilesize(volume.size)}, {volume.type_name})
      </Badge>
    </Tooltip>
  );
};
