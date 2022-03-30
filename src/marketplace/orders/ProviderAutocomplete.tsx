import React from 'react';
import { Form } from 'react-bootstrap';
import { AsyncPaginate } from 'react-select-async-paginate';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { providerAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface ProviderAutocompleteProps {
  className?: string;
}

export const ProviderAutocomplete: React.FC<ProviderAutocompleteProps> = (
  props,
) => (
  <div className={`form-group ${props.className}`}>
    <Form.Label>{translate('Service provider')}</Form.Label>
    <Field
      name="provider"
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
        />
      )}
    />
  </div>
);

ProviderAutocomplete.defaultProps = {
  className: 'col-sm-3',
};
