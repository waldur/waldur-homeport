import { FC } from 'react';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const AccountingPeriodFilter: FC<any> = ({
  name = 'accounting_period',
  title = translate('Accounting period'),
  ...props
}) => (
  <SelectFilter
    title={title}
    name={name}
    badgeValue={(value) => value?.label}
    placeholder={translate('Select accounting period')}
    isClearable={false}
    className="accounting-period-selector"
    ellipsis={false}
    {...props}
  />
);
