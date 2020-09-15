import * as React from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { Field, reduxForm, formValueSelector } from 'redux-form';

import { getSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

const providerAutocomplete = async (
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    name: query,
    type: 'OpenStack',
    shared: true,
    field: ['name', 'uuid'],
    o: 'name',
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const response = await getSelectData('/service-settings/', params);
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

export const SharedProviderFilter = () => (
  <div className="ibox">
    <div className="ibox-content">
      <div className="row">
        <div className="form-group col-sm-3">
          <label className="control-label">{translate('Provider')}</label>
          <Field
            name="provider"
            component={(fieldProps) => (
              <AsyncPaginate
                placeholder={translate('Select provider...')}
                defaultOptions
                loadOptions={(query, prevOptions, { page }) =>
                  providerAutocomplete(query, prevOptions, page)
                }
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
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
      </div>
    </div>
  </div>
);

const FORM_ID = 'SharedProviderFilter';

export const providerSelector = (state) =>
  formValueSelector(FORM_ID)(state, 'provider');

const enhance = reduxForm({ form: FORM_ID });

export const SharedProviderFilterContainer = enhance(SharedProviderFilter);
