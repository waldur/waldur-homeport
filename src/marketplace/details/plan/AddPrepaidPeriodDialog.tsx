import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { Form as ReactFinalForm, Field, useFormState } from 'react-final-form';
import { Project } from 'waldur-js-client';

import { formatDate, formatISODate } from '@/core/dateUtils';
import { SubmitButton } from '@/form';
import { DateField } from '@/form/DateField';
import { SelectField } from '@/form/SelectField';
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
      <div className="mb-4">
        <Form.Label>{translate('Subscription period')}</Form.Label>
        <Field
          name="months"
          component={SelectField}
          options={monthOptions}
          simpleValue
          isClearable={false}
        />
      </div>

      {isCustomRange ? (
        <div className="mb-4">
          <div className="row">
            <div className="col-md-6">
              <Form.Label>{translate('From')}</Form.Label>
              <input
                type="text"
                className="form-control"
                value={formatDate(effectiveStartDate)}
                disabled
              />
            </div>
            <div className="col-md-6">
              <Form.Label>{translate('To')}</Form.Label>
              <Field
                name="end_date"
                component={DateField}
                {...datePickerConstraints}
              />
              {durationInMonths !== null && (
                <div className="text-muted mt-1 small">
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
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
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
