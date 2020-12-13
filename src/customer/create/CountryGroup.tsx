import Axios from 'axios';
import { components } from 'react-select';
import { useAsync } from 'react-use';
import WindowedSelect from 'react-windowed-select';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

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
