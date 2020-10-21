import Axios from 'axios';
import * as React from 'react';
import { components } from 'react-select';
import useAsync from 'react-use/lib/useAsync';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';
import { SelectField } from './SelectField';

const CountryRenderer = (option) => (
  <>
    <i className="f16">
      <i className={`flag ${option.value.toLowerCase()}`}></i>
    </i>{' '}
    {option.display_name}
  </>
);

export const Option = (props) => (
  <components.Option {...props}>
    <CountryRenderer {...props.data} />
  </components.Option>
);

export const SingleValue = (props) => (
  <components.SingleValue {...props}>
    <CountryRenderer {...props.data} />
  </components.SingleValue>
);

export const loadCountries = async () => {
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
      components={{ Option, SingleValue }}
      getOptionLabel={(option) => option.display_name}
      options={value || []}
      isLoading={loading}
      isClearable={true}
    />
  );
};
