import { FC } from 'react';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const getOrderTypeOptions = () => [
  { value: 'Create', label: translate('Create') },
  { value: 'Update', label: translate('Update') },
  { value: 'Terminate', label: translate('Terminate') },
];

export const OrderTypeFilter: FC<any> = (props) => {
  return (
    <SelectFilter
      title={translate('Type')}
      name="type"
      badgeValue={(value) => value?.label}
      placeholder={translate('Select type...')}
      options={getOrderTypeOptions()}
      isClearable={true}
      {...props}
    />
  );
};
