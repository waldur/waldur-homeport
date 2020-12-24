import Axios from 'axios';
import { FunctionComponent } from 'react';
import { components } from 'react-select';
import { useAsync } from 'react-use';
import WindowedSelect from 'react-windowed-select';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';
import 'world-flags-sprite/stylesheets/flags16.css';

const CountryRenderer = (option) => (
  <>
    <i className="f16">
      <i className={`flag ${option.value.toLowerCase()}`}></i>
    </i>{' '}
    {option.display_name}
  </>
);

export const Option: FunctionComponent<any> = (props) => (
  <components.Option {...props}>
    <CountryRenderer {...props.data} />
  </components.Option>
);

export const SingleValue: FunctionComponent<any> = (props) => (
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

export const CountryGroup: FunctionComponent = () => {
  const { loading, value: options } = useAsync(loadCountries);
  return (
    <InputGroup
      name="country"
      label={translate('Country')}
      component={({ input: { value, onChange } }) => (
        <WindowedSelect
          value={value}
          onChange={onChange}
          placeholder={translate('Select country...')}
          components={{ Option, SingleValue }}
          getOptionLabel={(option) => option.display_name}
          options={options || []}
          isLoading={loading}
          isClearable={true}
        />
      )}
    />
  );
};
