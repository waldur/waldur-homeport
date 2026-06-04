import { FC } from 'react';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

const getAutoApprovedOptions = () => [
  { value: 'true', label: translate('Yes') },
  { value: 'false', label: translate('No') },
];

export const OrderAutoApprovedFilter: FC<any> = (props) => {
  return (
    <SelectFilter
      title={translate('Auto-approved')}
      name="was_auto_approved"
      badgeValue={(value) => value?.label}
      placeholder={translate('Auto-approved?')}
      options={getAutoApprovedOptions()}
      isClearable={true}
      {...props}
    />
  );
};
