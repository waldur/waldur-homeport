import { FC, useEffect } from 'react';
import { Field as FinalField, useForm } from 'react-final-form';

import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';

const ProviderSelectField: FC<any> = (fieldProps) => {
  const form = useForm();
  /**
   * Automatically pre-selects the first available service provider on component mount
   * if no provider is currently selected in the form.
   */
  useEffect(() => {
    if (!fieldProps.input.value) {
      providerAutocomplete('', [], { page: 1 }).then((result) => {
        if (result.options && result.options.length > 0) {
          form.change('provider', result.options[0]);
        }
      });
    }
  }, [fieldProps.input.value, form]);

  return (
    <AsyncPaginate
      placeholder={translate('Select provider...')}
      loadOptions={providerAutocomplete}
      defaultOptions
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.customer_name}
      value={fieldProps.input.value}
      onChange={(value) => fieldProps.input.onChange(value)}
      noOptionsMessage={() => translate('No providers')}
      isClearable={true}
    />
  );
};

export const ProviderFilter: FC = () => (
  <FinalField name="provider" component={ProviderSelectField} />
);
