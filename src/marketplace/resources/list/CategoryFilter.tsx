import React, { useMemo } from 'react';
import { Project } from 'waldur-js-client';

import { translate } from '@/i18n';
import { categoryAutocomplete } from '@/marketplace/common/autocompletes';
import { AsyncSelectFilter } from '@/table';
import { Customer } from '@/workspace/types';

export const CategoryFilter: React.FC<{
  project?: Project;
  customer?: Customer;
  [key: string]: any;
}> = (props) => {
  const loadOptions = useMemo(
    () =>
      categoryAutocomplete({
        resource_customer_uuid: props.customer?.uuid,
        resource_project_uuid: props.project?.uuid,
      }),
    [props.customer?.uuid, props.project?.uuid],
  );

  return (
    <AsyncSelectFilter
      title={translate('Category')}
      name="category"
      badgeValue={(value) => value?.title}
      placeholder={translate('Select category...')}
      loadOptions={loadOptions}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.title}
      {...props}
    />
  );
};
