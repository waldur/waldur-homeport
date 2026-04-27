import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';

export const getOptions = () => [
  { value: undefined, label: translate('All') },
  { value: true, label: translate('Running accounting') },
  { value: false, label: translate('Not running accounting') },
];

interface AccountingRunningFieldProps {
  reactSelectProps?: Partial<SelectProps>;
}

export const AccountingRunningField: FunctionComponent<
  AccountingRunningFieldProps
> = (props) => (
  <Field
    name="accounting_is_running"
    component={(prop) => (
      <Select
        placeholder={translate('Show with running accounting')}
        value={prop.input.value}
        onChange={(value) => prop.input.onChange(value)}
        options={getOptions()}
        isClearable={false}
        className="accounting-period-selector metronic-select-container"
        classNamePrefix="metronic-select"
        {...props.reactSelectProps}
      />
    )}
  />
);
