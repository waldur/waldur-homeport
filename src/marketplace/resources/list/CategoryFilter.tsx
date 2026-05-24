import React, { useMemo } from 'react';
import { Field } from 'react-final-form';
import { Project } from 'waldur-js-client';

import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { categoryAutocomplete } from '@/marketplace/common/autocompletes';
import { Customer } from '@/workspace/types';

export const CategoryFilter: React.FC<{
  reactSelectProps?: any;
  project?: Project;
  customer?: Customer;
}> = (props) => {
  const loadCategories = useMemo(
    () =>
      categoryAutocomplete({
        resource_customer_uuid: props.customer?.uuid,
        resource_project_uuid: props.project?.uuid,
      }),
    [props.customer?.uuid, props.project?.uuid],
  );

  return (
    <Field
      name="category"
      component={(fieldProps) => (
        <AsyncSelect
          placeholder={translate('Select category...')}
          loadOptions={loadCategories}
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.title}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No categories')}
          isClearable={true}
          variant="tableFilter"
          {...props.reactSelectProps}
        />
      )}
    />
  );
};
