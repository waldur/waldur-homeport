import React, { useMemo } from 'react';

import { translate } from '@/i18n';
import { CallOffering } from '@/proposals/types';
import { SelectFilter } from '@/table';

export const CallOfferingFilter: React.FC<{
  options?: Partial<Pick<CallOffering, 'offering_name' | 'offering_uuid'>>[];
  [key: string]: any;
}> = ({ options = [], ...props }) => {
  // Narrowed to the two fields this filter reads, rather than passed through
  // whole. A call offering also carries `options` — the offering's order form
  // schema — and react-select decides what is a group by asking whether the
  // key is there at all, so every offering was read as a group of options and
  // the render threw on mapping over an object.
  const selectOptions = useMemo(
    () =>
      options.map(({ offering_name, offering_uuid }) => ({
        offering_name,
        offering_uuid,
      })),
    [options],
  );

  return (
    <SelectFilter
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => value?.offering_name}
      placeholder={translate('Select offering...')}
      options={selectOptions}
      isClearable={true}
      getOptionLabel={(option) => option.offering_name}
      getOptionValue={(option) => option.offering_uuid}
      {...props}
    />
  );
};
