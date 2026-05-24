import React from 'react';
import { Field } from 'react-final-form';

import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { tagAutocomplete } from '@/marketplace/common/autocompletes';

export const TagFilter: React.FC<{
  reactSelectProps?: any;
}> = (props) => {
  return (
    <Field
      name="tag"
      component={(fieldProps) => (
        <AsyncSelect
          placeholder={translate('Select tag...')}
          loadOptions={tagAutocomplete}
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No tags')}
          isClearable={true}
          variant="tableFilter"
          {...props.reactSelectProps}
        />
      )}
    />
  );
};
