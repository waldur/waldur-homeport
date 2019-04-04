import * as moment from 'moment-timezone';
import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

const makeAccountingPeriods = () => {
  let date = moment().startOf('month');
  const choices = [];
  for (let i = 0; i < 12; i++) {
    const month = date.month() + 1;
    const year = date.year();
    const label = date.format('MMMM, YYYY');
    choices.push({
      label,
      value: { year, month, current: i === 0},
    });
    date = date.subtract(1, 'month');
  }
  return choices;
};

export const accountingPeriods = makeAccountingPeriods();

export const AccountingPeriodField = () => (
  <Field name="accounting_period"
    component={prop =>
      <Select
        className="accounting-period-selector"
        placeholder={translate('Select accounting period')}
        labelKey="label"
        valueKey="value"
        value={prop.input.value}
        onChange={prop.input.onChange}
        onBlur={e => e.preventDefault()}
        options={accountingPeriods}
        clearable={false}
      />
    }
  />
);
