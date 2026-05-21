import { FC } from 'react';
import { Field } from 'react-final-form';
import { Props as SelectProps } from 'react-select';

import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';
import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { formatResourceShort } from '@/marketplace/utils';

interface ResourceAutocompleteProps {
  params?: Record<string, any>;
  reactSelectProps?: Partial<SelectProps>;
}

export const ResourceAutocomplete: FC<ResourceAutocompleteProps> = ({
  params = {},
  reactSelectProps,
}) => {
  const renderField = (fieldProps) => (
    <AsyncPaginate
      placeholder={translate('Select resource...')}
      loadOptions={(query, prevOptions, { page }) =>
        resourceAutocomplete(
          {
            name: query,
            field: ['name', 'url', 'uuid', 'offering_name'],
            ...params,
          },
          prevOptions,
          page,
        )
      }
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => formatResourceShort(option)}
      value={fieldProps.input.value}
      onChange={(value) => fieldProps.input.onChange(value)}
      noOptionsMessage={() => translate('No resources')}
      isClearable={true}
      {...reactSelectProps}
    />
  );

  return <Field name="resource" component={renderField} />;
};
