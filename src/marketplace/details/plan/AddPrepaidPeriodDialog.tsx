import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { Form as ReactFinalForm, useFormState } from 'react-final-form';
import { Project } from 'waldur-js-client';

import { FormField, FormLabel } from 'waldur-ui';

import { formatDate, formatISODate } from '@/core/dateUtils';
import { SelectGroup, SubmitButton, DateGroup } from '@/form';
import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import {
  calculateMonthsDifference,
  getDatePickerConstraints,
  getMonthOptions,
  PrepaidConstraints,
} from './prepaidConstraints';

interface PrepaidFormContentProps {
  constraints: PrepaidConstraints;
  project: Project;
  startDate: string;
}

const PrepaidFormContent = ({
  constraints,
  project,
  startDate,
}: PrepaidFormContentProps) => {
  const { values } = useFormState();
  const selectedMonths = values.months;
  const customEndDate = values.end_date;

  const effectiveStartDate = useMemo(
    () => startDate || formatISODate(DateTime.now()),
    [startDate],
  );

  const monthOptions = useMemo(
    () => getMonthOptions(constraints, project, startDate),
    [constraints, project, startDate],
  );

  const isCustomRange = selectedMonths === 'custom';

  const prepaidEndDate = useMemo(() => {
    if (isCustomRange && customEndDate) {
      return customEndDate;
    } else if (typeof selectedMonths === 'number') {
      return DateTime.fromISO(effectiveStartDate)
        .plus({ months: selectedMonths })
        .toISODate();
    }
    return null;
  }, [isCustomRange, customEndDate, selectedMonths, effectiveStartDate]);

  const durationInMonths = useMemo(() => {
    if (isCustomRange && customEndDate) {
      return calculateMonthsDifference(effectiveStartDate, customEndDate);
    }
    return null;
  }, [isCustomRange, customEndDate, effectiveStartDate]);

  const datePickerConstraints = useMemo(
    () => getDatePickerConstraints(constraints, project, effectiveStartDate),
    [effectiveStartDate, constraints, project],
  );

  return (
    <>
      <SelectGroup
        name="months"
        label={translate('Subscription period')}
        options={monthOptions}
        simpleValue
        isClearable={false}
      />

      {isCustomRange ? (
        <div className="mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
            <div>
              <FormField>
                <FormLabel>{translate('From')}</FormLabel>
                <BaseInputField
                  type="text"
                  value={formatDate(effectiveStartDate)}
                  disabled
                />
              </FormField>
            </div>
            <div>
              <DateGroup
                name="end_date"
                label={translate('To')}
                {...datePickerConstraints}
              />
              {durationInMonths !== null && (
                <div className="text-quaternary mt-1 small">
                  {translate('Duration: {count} months', {
                    count: durationInMonths,
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : prepaidEndDate ? (
        <p>
          {translate('Your prepaid period will be from {start} to {end}.', {
            start: formatDate(effectiveStartDate),
            end: formatDate(prepaidEndDate),
          })}
        </p>
      ) : null}
    </>
  );
};

interface AddPrepaidPeriodDialogProps {
  constraints: PrepaidConstraints;
  project: Project;
  onSubmit: (values: { end_date: string }) => void;
  resolve: () => void;
  startDate?: string;
}

export const AddPrepaidPeriodDialog = ({
  constraints,
  project,
  onSubmit,
  resolve,
  startDate,
}: AddPrepaidPeriodDialogProps) => {
  const handleSubmit = (values) => {
    const effectiveStartDate = startDate || formatISODate(DateTime.now());
    const endDate =
      values.months === 'custom'
        ? values.end_date
        : DateTime.fromISO(effectiveStartDate)
            .plus({ months: values.months })
            .toISODate();

    onSubmit({ end_date: endDate });
    resolve();
  };

  return (
    <ReactFinalForm
      onSubmit={handleSubmit}
      initialValues={{
        months: constraints.min_prepaid_duration || 1,
      }}
    >
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Set subscription period')}
            footer={
              <>
                <CloseDialogButton className="flex-1" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Confirm')}
                  variant="primary"
                  className="flex-1"
                />
              </>
            }
          >
            <PrepaidFormContent
              constraints={constraints}
              project={project}
              startDate={startDate}
            />
          </ModalDialog>
        </form>
      )}
    </ReactFinalForm>
  );
};
