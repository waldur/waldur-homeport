import Axios from 'axios';
import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';
import { SelectField } from './SelectField';

const CountryRenderer = option => (
  <>
    <i className="f16">
      <i className={`flag ${option.value.toLowerCase()}`}></i>
    </i>{' '}
    {option.display_name}
  </>
);

const loadCountries = async () => {
  const response = await Axios.request({
    method: 'OPTIONS',
    url: ENV.apiEndpoint + 'api/customers/',
  });
  return response.data.actions.POST.country.choices;
};

export const CountryGroup = () => {
  const { loading, value } = useAsync(loadCountries);
  return (
    <InputGroup
      name="country"
      label={translate('Country')}
      component={SelectField}
      placeholder={translate('Select country...')}
      optionRenderer={CountryRenderer}
      valueRenderer={CountryRenderer}
      labelKey="display_name"
      options={value || []}
      isLoading={loading}
    />
  );
};
