import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { AsyncPaginate } from 'react-select-async-paginate';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { relatedCustomerAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { getCustomer } from '@waldur/workspace/selectors';

export const RelatedCustomerFilter: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  return (
    <div className="form-group col-sm-3">
      <label className="control-label">
        {translate('Client organization')}
      </label>
      <Field
        name="organization"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Select organization...')}
            loadOptions={(query, prevOptions, additional) =>
              relatedCustomerAutocomplete(
                customer.uuid,
                query,
                prevOptions,
                additional,
              )
            }
            defaultOptions
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            noOptionsMessage={() => translate('No organizations')}
            isClearable={true}
            additional={{
              page: 1,
            }}
          />
        )}
      />
    </div>
  );
};
