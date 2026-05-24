import { FieldValidator } from 'final-form';
import { FunctionComponent, useMemo } from 'react';
import { Field } from 'react-final-form';
import {
  adminArrowCustomerMappingsList,
  ArrowCustomerMapping,
} from 'waldur-js-client';

import { AsyncSelect } from '@/form/select';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';

interface ArrowCustomerMappingAutocompleteProps {
  name?: string;
  placeholder?: string;
  reactSelectProps?: any;
  validator?: FieldValidator<ArrowCustomerMapping>;
}

/**
 * Autocomplete that returns full ArrowCustomerMapping objects,
 * enabling access to settings_uuid, waldur_customer_uuid, etc.
 */
export const ArrowCustomerMappingAutocomplete: FunctionComponent<
  ArrowCustomerMappingAutocompleteProps
> = (props) => {
  const loadOptions = useMemo(
    () =>
      createLoadOptions(adminArrowCustomerMappingsList, 'waldur_customer', {
        is_active: true,
      }),
    [],
  );

  return (
    <Field
      name={props.name || 'customerMapping'}
      validate={props.validator}
      component={(fieldProps) => (
        <AsyncSelect
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
