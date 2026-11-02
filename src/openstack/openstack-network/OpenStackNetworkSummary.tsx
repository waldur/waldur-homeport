import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ResourceSummaryProps } from '@/resource/summary';

import { Network } from './types';

export const OpenStackNetworkSummary = (
  props: ResourceSummaryProps<Network>,
) => {
  const { resource } = props;
  return (
    <>
      <PropertyItem
        label={translate('Type')}
        value={resource.type}
        valueClass="ellipsis"
      />

      <PropertyItem
        label={translate('Segmentation ID')}
        value={resource.segmentation_id}
      />

      <PropertyItem
        label={translate('Is external')}
        value={propVal.boolean(resource.is_external)}
      />

      <PropertyItem label={translate('MTU')} value={resource.mtu} />
      <PropertyItem
        label={translate('Backend ID')}
        value={resource.backend_id}
        hasCopy
      />
    </>
  );
};
