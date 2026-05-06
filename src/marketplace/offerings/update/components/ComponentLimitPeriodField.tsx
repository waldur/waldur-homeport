import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

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
      value: 'quarterly',
      label: translate('Maximum quarterly'),
      description: translate(
        'Maximum quarterly - every quarter service provider can report up to the amount requested by user.',
      ),
    },
    {
      value: 'annual',
      label: translate('Maximum annually'),
      description: translate(
        'Every year service provider can report up to the amount requested by user.',
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

interface ComponentLimitPeriodFieldProps {
  limitPeriod: LimitPeriodOption;
  readOnly?: boolean;
  spaceless?: boolean;
}

export const ComponentLimitPeriodField: FunctionComponent<
  ComponentLimitPeriodFieldProps
> = (props) => (
  <FormGroup
    label={translate('Limit period')}
    spaceless
    help={props.limitPeriod?.description}
    helpEnd
  >
    <Field
      name="limit_period"
      component={(fieldProps) =>
        props.readOnly ? (
          fieldProps.input.value.label
        ) : (
          <Select
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            options={getLimitPeriods()}
            isClearable={false}
          />
        )
      }
    />
  </FormGroup>
);
