import { FunctionComponent } from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { PeriodOption } from '@waldur/form/types';
import { translate } from '@waldur/i18n';

interface AccountingPeriodFieldProps {
  options: PeriodOption[];
}

export const AccountingPeriodField: FunctionComponent<AccountingPeriodFieldProps> = (
  props,
) => (
  <Field
    name="accounting_period"
    component={(prop) => (
      <Select
        className="accounting-period-selector"
        placeholder={translate('Select accounting period')}
        value={prop.input.value}
        onChange={prop.input.onChange}
        onBlur={(e) => e.preventDefault()}
        options={props.options}
        isClearable={false}
      />
    )}
  />
);
