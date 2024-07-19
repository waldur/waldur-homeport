import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { PeriodOption } from '@waldur/form/types';
import { translate } from '@waldur/i18n';

interface AccountingPeriodFieldProps {
  options: PeriodOption[];
  reactSelectProps?: Partial<SelectProps>;
}

export const AccountingPeriodField: FunctionComponent<
  AccountingPeriodFieldProps
> = (props) => (
  <Field
    name="accounting_period"
    component={(prop) => (
      <Select
        placeholder={translate('Select accounting period')}
        value={prop.input.value}
        onChange={prop.input.onChange}
        onBlur={(e) => e.preventDefault()}
        options={props.options}
        isClearable={false}
        className="accounting-period-selector metronic-select-container"
        classNamePrefix="metronic-select"
        {...props.reactSelectProps}
      />
    )}
  />
);
