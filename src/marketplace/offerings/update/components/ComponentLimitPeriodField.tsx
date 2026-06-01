import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { SelectGroup, FormGroup } from '@/form';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

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
> = (props) => {
  if (props.readOnly) {
    return (
      <FormGroup
        label={translate('Limit period')}
        spaceless={props.spaceless}
        help={props.limitPeriod?.description}
        helpEnd
      >
        <Field
          name="limit_period"
          subscription={{ value: true }}
          render={({ input }) => renderFieldOrDash(input.value?.label)}
        />
      </FormGroup>
    );
  }

  return (
    <SelectGroup
      name="limit_period"
      label={translate('Limit period')}
      spaceless={props.spaceless}
      tooltip={props.limitPeriod?.description}
      tooltipEnd
      options={getLimitPeriods()}
      isClearable={false}
    />
  );
};
