import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { providerAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const ProviderCampaignServiceProviderFilter: FunctionComponent<{
  reactSelectProps?: Partial<SelectProps>;
}> = (props) => (
  <Field
    name="service_provider"
    label={translate('Service provider')}
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select provider...')}
        loadOptions={providerAutocomplete}
        defaultOptions
        getOptionValue={(option) => option.customer_uuid}
        getOptionLabel={(option) => option.customer_name}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No providers')}
        isClearable={true}
        additional={{
          page: 1,
        }}
        required={true}
        {...props.reactSelectProps}
      />
    )}
  />
);
