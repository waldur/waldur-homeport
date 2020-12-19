import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';
import WindowedSelect from 'react-windowed-select';
import { Field } from 'redux-form';

import {
  loadCountries,
  Option,
  SingleValue,
} from '@waldur/customer/create/CountryGroup';
import { translate } from '@waldur/i18n';

export const SelectField = ({ input: { value, onChange }, ...props }) => (
  <WindowedSelect value={value} onChange={onChange} {...props} />
);

export const SelectCountryField: FunctionComponent = () => {
  const { loading, value } = useAsync(loadCountries);
  return (
    <div className="form-group">
      <label className="control-label col-sm-2">{translate('Country')}</label>
      <div className="col-sm-8">
        <Field
          name="country"
          component={SelectField}
          components={{ Option, SingleValue }}
          placeholder={translate('Select country...')}
          getOptionLabel={(option) => option.display_name}
          options={value || []}
          isLoading={loading}
          isClearable={true}
          noOptionsMessage={() => translate('No countries')}
        />
      </div>
    </div>
  );
};
