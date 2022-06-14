import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const getOptions = () => [
  { value: true, label: translate('Running accounting') },
  { value: false, label: translate('Not running accounting') },
  { value: undefined, label: translate('All') },
];

export const AccountingRunningField: FunctionComponent = () => (
  <Field
    name="accounting_is_running"
    component={(prop) => (
      <Select
        placeholder={translate('Show with running accounting')}
        value={prop.input.value}
        onChange={(value) => prop.input.onChange(value)}
        options={getOptions()}
        isClearable={false}
      />
    )}
  />
);
