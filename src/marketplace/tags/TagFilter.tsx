import React from 'react';
import { Field } from 'react-final-form';
import { Props as SelectProps } from 'react-select';

import { AsyncPaginate, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { tagAutocomplete } from '@/marketplace/common/autocompletes';

export const TagFilter: React.FC<{
  reactSelectProps?: Partial<SelectProps>;
}> = (props) => {
  return (
    <Field
      name="tag"
      component={(fieldProps) => (
        <AsyncPaginate
          placeholder={translate('Select tag...')}
          loadOptions={(query: string, prevOptions, { page }) =>
            tagAutocomplete(query, prevOptions, { page })
          }
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No tags')}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
          {...props.reactSelectProps}
        />
      )}
    />
  );
};
