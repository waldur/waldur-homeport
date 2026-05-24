import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { Select } from '@/form/select';
import { translate } from '@/i18n';

export const getOptions = () => [
  { value: undefined, label: translate('All') },
  { value: true, label: translate('Running accounting') },
  { value: false, label: translate('Not running accounting') },
];

interface AccountingRunningFieldProps {
  reactSelectProps?: any;
}

export const AccountingRunningField: FunctionComponent<
  AccountingRunningFieldProps
> = (props) => {
  const renderField = (prop) => (
    <Select
      placeholder={translate('Show with running accounting')}
      value={prop.input.value}
      onChange={(value) => prop.input.onChange(value)}
      options={getOptions()}
      isClearable={false}
      className="accounting-period-selector metronic-select-container"
      {...props.reactSelectProps}
    />
  );

  return <Field name="accounting_is_running" component={renderField} />;
};
