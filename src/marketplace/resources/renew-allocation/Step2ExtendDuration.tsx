import { DateTime } from 'luxon';
import { FC, useCallback, useMemo } from 'react';
import { useForm, useFormState } from 'react-final-form';
import { Resource } from 'waldur-js-client';

import { formatDate, parseDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { Field } from '@/resource/summary';
import { WizardModal, WizardStepProps } from '@/wizard';

import { RenewalCostBreakdown } from './RenewalCostBreakdown';
import { RenewAllocationFormData } from './types';

const SelectFieldInline = ({ input, options }) => (
  <select
    className="form-select"
    value={input.value}
    onChange={(e) => input.onChange(Number(e.target.value))}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export const Step2ExtendDuration: FC<WizardStepProps> = (props) => {
  const resources: Resource[] = props.data.resources;
  const isMulti = resources?.length > 1;
  const { values } = useFormState<RenewAllocationFormData>();
  const form = useForm();

  const currentEndDate = useMemo(
    () => (resources[0].end_date ? formatDate(resources[0].end_date) : 'N/A'),
    [resources],
  );

  const prepaidComponent = useMemo(
    () => resources[0].offering_components?.find((c) => c.is_prepaid),
    [resources],
  );

  const minMonths = prepaidComponent?.min_renewal_duration ?? 1;
  const maxMonths = prepaidComponent?.max_renewal_duration ?? 12;
  const step = prepaidComponent?.renewal_duration_step ?? 1;

  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = minMonths; i <= maxMonths; i += step) {
      options.push({
        value: i,
        label:
          i === 1
            ? translate('1 month')
            : translate('{count} months', { count: i }),
      });
    }
    return options;
  }, [minMonths, maxMonths, step]);

  const handleMonthChange = useCallback(
    (months: number) => {
      form.change('extension_months', months);
    },
    [form],
  );

  const extensionMonths = Number(values.extension_months) || 0;

  const newEndDateText = useMemo(() => {
    if (!extensionMonths) return null;
    const base = resources[0].end_date
      ? parseDate(resources[0].end_date)
      : DateTime.now();
    return formatDate(base.plus({ months: extensionMonths }));
  }, [extensionMonths, resources]);

  return (
    <WizardModal {...props}>
      {!isMulti && (
        <Field
          label={translate('Current end date')}
          value={currentEndDate}
          labelCol="auto"
          valueCol="auto"
          valueClass="ms-auto"
          className="mb-5"
          xs="auto"
        />
      )}
      <FormGroup
        label={translate('Extension period')}
        description={
          isMulti
            ? translate(
                'New end dates will be calculated automatically for all resources.',
              )
            : newEndDateText
              ? translate('New end date: {date}', { date: newEndDateText })
              : null
        }
      >
        <div style={{ maxWidth: 300 }}>
          <SelectFieldInline
            input={{
              value: extensionMonths,
              onChange: handleMonthChange,
            }}
            options={monthOptions}
          />
        </div>
      </FormGroup>

      {!isMulti && (
        <RenewalCostBreakdown
          resource={resources[0]}
          extensionMonths={extensionMonths}
        />
      )}
    </WizardModal>
  );
};
