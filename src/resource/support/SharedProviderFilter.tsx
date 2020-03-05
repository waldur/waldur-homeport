import * as React from 'react';
import { Async } from 'react-select';
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
  return getList('/service-settings/', params).then(options => ({ options }));
};

export const SharedProviderFilter = () => (
  <div className="ibox">
    <div className="ibox-content">
      <div className="row">
        <div className="form-group col-sm-3">
          <label className="control-label">{translate('Provider')}</label>
          <Field
            name="provider"
            component={fieldProps => (
              <Async
                placeholder={translate('Select provider...')}
                loadOptions={providerAutocomplete}
                valueKey="uuid"
                labelKey="name"
                value={fieldProps.input.value}
                onChange={value => fieldProps.input.onChange(value)}
              />
            )}
          />
        </div>
      </div>
    </div>
  </div>
);

const FORM_ID = 'SharedProviderFilter';

export const providerSelector = state =>
  formValueSelector(FORM_ID)(state, 'provider');

const enhance = reduxForm({ form: FORM_ID });

export const SharedProviderFilterContainer = enhance(SharedProviderFilter);
