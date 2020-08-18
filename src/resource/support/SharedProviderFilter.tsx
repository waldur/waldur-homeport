import * as React from 'react';
import AsyncSelect from 'react-select/async';
import { Field, reduxForm, formValueSelector } from 'redux-form';

import { getList } from '@waldur/core/api';
import { translate } from '@waldur/i18n';

const providerAutocomplete = (query: string) => {
  const params = {
    name: query,
    type: 'OpenStack',
    shared: true,
    field: ['name', 'uuid'],
    o: 'name',
  };
  return getList('/service-settings/', params);
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
              <AsyncSelect
                placeholder={translate('Select provider...')}
                defaultOptions
                loadOptions={providerAutocomplete}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
                value={fieldProps.input.value}
                onChange={(value) => fieldProps.input.onChange(value)}
                noOptionsMessage={() => translate('No providers')}
                isClearable={true}
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
