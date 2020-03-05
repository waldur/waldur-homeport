import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export interface LimitPeriodOption {
  value: string;
  label: string;
  description: string;
}

export function getLimitPeriods(): LimitPeriodOption[] {
  return [
    {
      value: 'month',
      label: translate('Maximum monthly'),
      description: translate(
        'Every month service provider can report up to the amount requested by user.',
      ),
    },
    {
      value: 'total',
      label: translate('Maximum total'),
      description: translate(
        'Service provider can report up to the requested amount over the whole active state of resource.',
      ),
    },
  ];
}

interface Props {
  limitPeriod: LimitPeriodOption;
}

export const ComponentLimitPeriodField = (props: Props) => (
  <FormGroup label={translate('Limit period')}>
    <Field
      name="limit_period"
      component={fieldProps => (
        <Select
          value={fieldProps.input.value}
          onChange={value => fieldProps.input.onChange(value)}
          options={getLimitPeriods()}
          clearable={false}
        />
      )}
    />
    {props.limitPeriod && (
      <div className="help-text m-t-sm">{props.limitPeriod.description}</div>
    )}
  </FormGroup>
);
