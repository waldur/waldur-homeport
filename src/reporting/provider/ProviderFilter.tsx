import { FC } from 'react';
import { Field, reduxForm } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { providerAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface ProviderFilterProps {
  // From redux-form
  change?: (field: string, value: unknown) => void;
}

const PureProviderFilter: FC<ProviderFilterProps> = () => (
  <Field
    name="provider"
    component={(fieldProps) => (
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
    )}
  />
);

export const ProviderFilter = reduxForm({
  form: 'ProviderReportingFilter',
  destroyOnUnmount: false,
})(PureProviderFilter);
