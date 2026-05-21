import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';

import { Select } from '@/form/themed-select';
import { PeriodOption } from '@/form/types';
import { translate } from '@/i18n';

export const AccountingPeriodFieldComponent: FunctionComponent<{
  options?: { label: string; value: PeriodOption }[];
  reactSelectProps?: Partial<SelectProps>;
  input?: any;
}> = (props) => (
  <Select
    placeholder={translate('Select accounting period')}
    value={props.input.value}
    onChange={props.input.onChange}
    onBlur={(e) => e.preventDefault()}
    options={props.options}
    isClearable={false}
    className="accounting-period-selector metronic-select-container"
    {...props.reactSelectProps}
  />
);
