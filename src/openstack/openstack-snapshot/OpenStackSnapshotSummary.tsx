import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ResourceSummaryProps } from '@/resource/summary';

export const OpenStackSnapshotSummary = ({
  resource,
}: ResourceSummaryProps) => {
  return (
    <>
      <PropertyItem
        label={translate('Size')}
        value={propVal.fileSize(resource.size, { unit: 'MB' })}
      />
      <PropertyItem
        label={translate('Volume')}
        value={propVal.link(resource.source_volume_name, {
          state: 'marketplace-resource-details',
          params: { resource_uuid: resource.source_volume_marketplace_uuid },
        })}
      />
    </>
  );
};
