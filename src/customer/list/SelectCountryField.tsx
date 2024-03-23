import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import {
  loadCountries,
  Option,
  SingleValue,
} from '@waldur/customer/create/CountryGroup';
import { WindowedSelect } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

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
        floating={false}
        component={WindowedSelectField}
        components={{ Option, SingleValue }}
        label={translate('Country')}
        placeholder={translate('Select country...')}
        getOptionLabel={(option) => option.display_name}
        getOptionValue={(option) => option.value}
        options={data || []}
        isLoading={isLoading}
        isClearable={true}
        noOptionsMessage={() => translate('No countries')}
      />
    </Form.Group>
  );
};
