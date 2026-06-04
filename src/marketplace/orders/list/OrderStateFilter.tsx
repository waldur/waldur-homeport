import { FC } from 'react';

import { translate } from '@/i18n';
import { Option } from '@/marketplace/common/registry';
import { SelectFilter } from '@/table';

import { createOrderStateOptions } from '../OrderStates';

interface OrderStateFilterProps {
  options?: () => Option[];
  [key: string]: any;
}

export const OrderStateFilter: FC<OrderStateFilterProps> = ({
  options,
  ...props
}) => {
  return (
    <SelectFilter
      title={translate('State')}
      name="state"
      badgeValue={(value) => value?.label}
      placeholder={translate('Select state...')}
      options={options ? options() : createOrderStateOptions()}
      isClearable={true}
      {...props}
    />
  );
};
