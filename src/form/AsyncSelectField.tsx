import { FunctionComponent } from 'react';
import { Field as FinalField } from 'react-final-form';
import { Field } from 'redux-form';

import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';

export const Select = ({ input, loadOptions, ...rest }) => (
  <AsyncPaginate
    value={input.value}
    onChange={input.onChange}
    loadOptions={(query, prevOptions, { page }) =>
      loadOptions(query, prevOptions, page)
    }
    classNamePrefix="metronic-select"
    {...rest}
    className={
      'metronic-select-container' + (rest.className ? ` ${rest.className}` : '')
    }
  />
);

export const AsyncSelectField: FunctionComponent<any> = (props) => {
  const { name, placeholder, ...rest } = props;
  return (
    <Field
      name={name}
      component={Select}
      defaultOptions
      placeholder={placeholder || translate('Select...')}
      loadOptions={props.loadOptions}
      noOptionsMessage={() => translate('No results found')}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.value || option.uuid}
      {...rest}
    />
  );
};

export const AsyncSelectFieldFinal: FunctionComponent<any> = (props) => {
  const { name, placeholder, ...rest } = props;
  return (
    <FinalField
      name={name}
      component={Select}
      defaultOptions
      placeholder={placeholder || translate('Select...')}
      loadOptions={props.loadOptions}
      noOptionsMessage={() => translate('No results found')}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.value || option.uuid}
      {...rest}
    />
  );
};
