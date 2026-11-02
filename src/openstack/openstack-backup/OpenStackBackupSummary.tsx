import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ResourceSummaryProps } from '@/resource/summary';

export const OpenStackBackupSummary = ({ resource }: ResourceSummaryProps) => {
  return (
    <PropertyItem
      label={translate('Instance')}
      value={propVal.link(resource.instance_name, {
        state: 'marketplace-resource-details',
        params: { resource_uuid: resource.instance_marketplace_uuid },
      })}
    />
  );
};
