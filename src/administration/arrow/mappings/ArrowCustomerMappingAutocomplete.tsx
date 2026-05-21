import { FieldValidator } from 'final-form';
import { FunctionComponent, useCallback } from 'react';
import { Field } from 'react-final-form';
import { Props as SelectProps } from 'react-select';
import {
  adminArrowCustomerMappingsList,
  ArrowCustomerMapping,
} from 'waldur-js-client';

import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';

interface ArrowCustomerMappingAutocompleteProps {
  name?: string;
  placeholder?: string;
  reactSelectProps?: Partial<SelectProps>;
  validator?: FieldValidator<ArrowCustomerMapping>;
}

/**
 * Autocomplete that returns full ArrowCustomerMapping objects,
 * enabling access to settings_uuid, waldur_customer_uuid, etc.
 */
export const ArrowCustomerMappingAutocomplete: FunctionComponent<
  ArrowCustomerMappingAutocompleteProps
> = (props) => {
  const loadOptions = useCallback(
    async (query: string, _prevOptions: any[], { page }: { page: number }) => {
      const response = await adminArrowCustomerMappingsList({
        query: {
          page,
          page_size: 10,
          is_active: true,
          ...(query ? { waldur_customer_name: query } : {}),
        },
      });

      return {
        options: response.data || [],
        hasMore: response.data?.length === 10,
        additional: { page: page + 1 },
      };
    },
    [],
  );

  return (
    <Field
      name={props.name || 'customerMapping'}
      validate={props.validator}
      component={(fieldProps) => (
        <AsyncPaginate
          placeholder={
            props.placeholder || translate('Select Arrow customer mapping...')
          }
          loadOptions={loadOptions}
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) =>
            `${option.waldur_customer_name} (${option.arrow_company_name || option.arrow_reference})`
          }
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No Arrow customer mappings found')}
          isClearable={true}
          {...props.reactSelectProps}
        />
      )}
    />
  );
};
