import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export const getOptions = () => ([
  {value: null, label: translate('All')},
  {value: true, label: translate('Running accounting')},
  {value: false, label: translate('Not running accounting')},
]);

export const AccountingRunningField = () => (
  <Field
    name="accounting_is_running"
    component={prop =>
      <Select
        placeholder={translate('Show with running accounting')}
        value={prop.input.value}
        onChange={value => prop.input.onChange(value)}
        options={getOptions()}
        clearable={false}
      />
    }
  />
);
