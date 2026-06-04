import { FC } from 'react';

import { translate } from '@/i18n';
import { getOfferingTypes } from '@/marketplace/common/registry';
import { SelectFilter } from '@/table';

interface OfferingTypeFilterProps {
  [key: string]: any;
}

export const OfferingTypeFilter: FC<OfferingTypeFilterProps> = (props) => {
  return (
    <SelectFilter
      title={translate('Integration type')}
      name="offering_type"
      badgeValue={(value) => value?.label}
      placeholder={translate('Select integration type...')}
      options={getOfferingTypes()}
      {...props}
    />
  );
};
