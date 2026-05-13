import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import { Select } from '@/form/themed-select';
import { PeriodOption } from '@/form/types';
import { translate } from '@/i18n';

interface AccountingPeriodFieldProps {
  options: { label: string; value: PeriodOption }[];
  reactSelectProps?: Partial<SelectProps>;
  name?: string;
}

export const AccountingPeriodFieldComponent: FunctionComponent<any> = (
  props,
) => (
  <Select
    placeholder={translate('Select accounting period')}
    value={props.input.value}
    onChange={props.input.onChange}
    onBlur={(e) => e.preventDefault()}
    options={props.options}
    isClearable={false}
    className="accounting-period-selector metronic-select-container"
    classNamePrefix="metronic-select"
    {...props.reactSelectProps}
  />
);

export const AccountingPeriodField: FunctionComponent<
  AccountingPeriodFieldProps
> = (props) => (
  <Field
    name={props.name || 'accounting_period'}
    component={AccountingPeriodFieldComponent}
    {...props}
  />
);
