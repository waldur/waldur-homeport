import { FC, useEffect } from 'react';
import { Field, WrappedFieldProps, reduxForm } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { providerAutocomplete } from '@waldur/marketplace/common/autocompletes';

const ProviderSelectField: FC<WrappedFieldProps> = (fieldProps) => {
  useEffect(() => {
    if (!fieldProps.input.value) {
      providerAutocomplete('', [], { page: 1 }).then((result) => {
        if (result.options && result.options.length > 0) {
          fieldProps.input.onChange(result.options[0]);
        }
      });
    }
  }, [fieldProps.input]);

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
      className="metronic-select-container"
      classNamePrefix="metronic-select"
    />
  );
};

const PureProviderFilter: FC = () => (
  <Field name="provider" component={ProviderSelectField as any} />
);

export const ProviderFilter = reduxForm({
  form: 'ProviderReportingFilter',
  destroyOnUnmount: false,
})(PureProviderFilter);
