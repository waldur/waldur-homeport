import React from 'react';

import { translate } from '@/i18n';
import { CallOffering } from '@/proposals/types';
import { SelectFilter } from '@/table';

export const CallOfferingFilter: React.FC<{
  options?: Partial<Pick<CallOffering, 'offering_name' | 'offering_uuid'>>[];
  [key: string]: any;
}> = ({ options = [], ...props }) => (
  <SelectFilter
    title={translate('Offering')}
    name="offering"
    badgeValue={(value) => value?.offering_name}
    placeholder={translate('Select offering...')}
    options={options}
    isClearable={true}
    getOptionLabel={(option) => option.offering_name}
    getOptionValue={(option) => option.offering_uuid}
    {...props}
  />
);
