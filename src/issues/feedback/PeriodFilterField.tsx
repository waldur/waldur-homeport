import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { PeriodOption } from '@waldur/form/types';
import { translate } from '@waldur/i18n';

interface PeriodFilterFieldProps {
  options: PeriodOption[];
}

export const PeriodFilterField: FunctionComponent<PeriodFilterFieldProps> = (
  props,
) => (
  <Field
    name="period"
    component={(prop) => (
      <Select
        placeholder={translate('Select period...')}
        value={prop.input.value}
        onChange={prop.input.onChange}
        onBlur={(e) => e.preventDefault()}
        options={props.options}
        isClearable={true}
      />
    )}
  />
);
