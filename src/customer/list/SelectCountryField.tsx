import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { components } from 'react-select';
import { Field } from 'redux-form';

import { get } from '@waldur/core/api';
import { WindowedSelect } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { CountryFlag } from '@waldur/marketplace/common/CountryFlag';

const CountryRenderer = (option) => (
  <>
    <CountryFlag countryCode={option.value} /> {option.label}
  </>
);

const Option: FunctionComponent<any> = (props) => (
  <components.Option {...props}>
    <CountryRenderer {...props.data} />
  </components.Option>
);

const SingleValue: FunctionComponent<any> = (props) => (
  <components.SingleValue {...props}>
    <CountryRenderer {...props.data} />
  </components.SingleValue>
);

const loadCountries = async () => {
  const response = await get('/customers/countries/');
  return response.data;
};

const WindowedSelectField = ({ input: { value, onChange }, ...props }) => (
  <WindowedSelect value={value} onChange={onChange} {...props} />
);

export const SelectCountryField: FunctionComponent = () => {
  const { isLoading, data } = useQuery(['countries'], loadCountries, {
    staleTime: 5 * 60 * 1000,
  });
  return (
    <Form.Group className="mb-7">
      <Field
        name="country"
        component={WindowedSelectField}
        components={{ Option, SingleValue }}
        label={translate('Country')}
        placeholder={translate('Select country...')}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        options={data || []}
        isLoading={isLoading}
        isClearable={true}
        noOptionsMessage={() => translate('No countries')}
      />
    </Form.Group>
  );
};
