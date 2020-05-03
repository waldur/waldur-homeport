import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { AccountingPeriodOption } from './types';

interface Props {
  options: AccountingPeriodOption[];
}

export const AccountingPeriodField = (props: Props) => (
  <Field
    name="accounting_period"
    component={prop => (
      <Select
        className="accounting-period-selector"
        placeholder={translate('Select accounting period')}
        labelKey="label"
        valueKey="value"
        value={prop.input.value}
        onChange={prop.input.onChange}
        onBlur={e => e.preventDefault()}
        options={props.options}
        clearable={false}
      />
    )}
  />
);
