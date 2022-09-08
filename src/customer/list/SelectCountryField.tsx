import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { useAsync } from 'react-use';
import { Field } from 'redux-form';

import {
  loadCountries,
  Option,
  SingleValue,
} from '@waldur/customer/create/CountryGroup';
import { WindowedSelect } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const WindowedSelectField = ({
  input: { value, onChange },
  ...props
}) => <WindowedSelect value={value} onChange={onChange} {...props} />;

export const SelectCountryField: FunctionComponent = () => {
  const { loading, value } = useAsync(loadCountries);
  return (
    <Form.Group className="mb-7">
      <Field
        name="country"
        floating={false}
        component={WindowedSelectField}
        components={{ Option, SingleValue }}
        placeholder={translate('Select country...')}
        getOptionLabel={(option) => option.display_name}
        getOptionValue={(option) => option.value}
        options={value || []}
        isLoading={loading}
        isClearable={true}
        noOptionsMessage={() => translate('No countries')}
      />
    </Form.Group>
  );
};
