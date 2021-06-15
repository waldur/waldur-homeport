import { FunctionComponent } from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { makeLastTwelveMonthsFilterPeriods } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';

export const EventDateFilter: FunctionComponent = () => (
  <Field
    name="date"
    component={(prop) => (
      <Select
        placeholder={translate('Select date...')}
        value={prop.input.value}
        onChange={prop.input.onChange}
        onBlur={(e) => e.preventDefault()}
        options={makeLastTwelveMonthsFilterPeriods()}
        isClearable={true}
      />
    )}
  />
);
