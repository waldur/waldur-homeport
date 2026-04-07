import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { Form, Field, useFormState } from 'react-final-form';
import { Project } from 'waldur-js-client';

import { formatDate, formatISODate } from '@waldur/core/dateUtils';
import { SubmitButton } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { SelectField } from '@waldur/form/SelectField';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { PrepaidConstraints } from './prepaidConstraints';

const getMonthOptions = (
  constraints: PrepaidConstraints,
  project: Project,
  startDate?: string,
) => {
  const effectiveStartDate = DateTime.fromISO(
    startDate || formatISODate(DateTime.now()),
  );

  let maxMonthsAllowedByProject: number | null = null;
  if (project?.end_date) {
    const projectEndDate = DateTime.fromISO(project.end_date);
    maxMonthsAllowedByProject = Math.floor(
      projectEndDate.diff(effectiveStartDate, 'months').months,
    );
  }

  const offeringMax = constraints.max_prepaid_duration;
  let trueMaxDuration: number;

  if (offeringMax && maxMonthsAllowedByProject) {
    trueMaxDuration = Math.min(offeringMax, maxMonthsAllowedByProject);
  } else if (offeringMax) {
    trueMaxDuration = offeringMax;
  } else if (maxMonthsAllowedByProject) {
    trueMaxDuration = maxMonthsAllowedByProject;
  } else {
    trueMaxDuration = 12;
  }

  const min = constraints.min_prepaid_duration || 1;
  const stepSize = constraints.prepaid_duration_step || 1;
  const max = Math.max(min, trueMaxDuration);

  const options = [];
  for (let i = min; i <= max; i += stepSize) {
    options.push({
      value: i,
      label:
        i === 1
          ? translate('1 month')
          : translate('{count} months', { count: i }),
    });
  }

  options.push({
    value: 'custom',
    label: translate('Custom range'),
  });

  return options;
};

const calculateMonthsDifference = (
  startDate: string,
  endDate: string,
): number => {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  const diff = end.diff(start, 'months').months;
  return Math.ceil(diff);
};

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

  const datePickerConstraints = useMemo(() => {
    const start = DateTime.fromISO(effectiveStartDate);
    const minDuration = constraints.min_prepaid_duration || 1;
    const maxDuration = constraints.max_prepaid_duration;

    const result: { minDate: string; maxDate?: string } = {
      minDate: start.plus({ months: minDuration }).toISODate(),
    };

    const projectEndDate = project.end_date
      ? DateTime.fromISO(project.end_date)
      : null;
    const offeringMaxEndDate = maxDuration
      ? start.plus({ months: maxDuration })
      : null;

    if (projectEndDate && offeringMaxEndDate) {
      result.maxDate =
        projectEndDate < offeringMaxEndDate
          ? projectEndDate.toISODate()
          : offeringMaxEndDate.toISODate();
    } else if (projectEndDate) {
      result.maxDate = projectEndDate.toISODate();
    } else if (offeringMaxEndDate) {
      result.maxDate = offeringMaxEndDate.toISODate();
    }

    return result;
  }, [
    effectiveStartDate,
    project.end_date,
    constraints.min_prepaid_duration,
    constraints.max_prepaid_duration,
  ]);

  return (
    <>
      <div className="mb-4">
        <label className="form-label">{translate('Subscription period')}</label>
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
              <label className="form-label">{translate('From')}</label>
              <input
                type="text"
                className="form-control"
                value={formatDate(effectiveStartDate)}
                disabled
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">{translate('To')}</label>
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
    <Form
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
    </Form>
  );
};
