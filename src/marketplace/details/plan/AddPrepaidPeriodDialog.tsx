import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { Form, Field, useFormState } from 'react-final-form';
import { Project } from 'waldur-js-client';

import { formatDate, formatISODate } from '@waldur/core/dateUtils';
import { SubmitButton } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { SelectField } from '@waldur/form/SelectField';
import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

// This utility function is now context-aware
const getMonthOptions = (
  component: OfferingComponent,
  project: Project,
  startDate?: string,
) => {
  // 1. Determine the effective start date
  const effectiveStartDate = DateTime.fromISO(
    startDate || formatISODate(DateTime.now()),
  );

  // 2. Calculate the maximum duration allowed by the project's end date
  let maxMonthsAllowedByProject: number | null = null;
  if (project.end_date) {
    const projectEndDate = DateTime.fromISO(project.end_date);
    // Use Math.floor because we can't offer a duration that exceeds the end date
    maxMonthsAllowedByProject = Math.floor(
      projectEndDate.diff(effectiveStartDate, 'months').months,
    );
  }

  // 3. Determine the true maximum duration
  const offeringMax = component?.max_prepaid_duration;
  let trueMaxDuration: number;

  if (offeringMax && maxMonthsAllowedByProject) {
    // The limit is the smaller of the offering's limit and the project's limit
    trueMaxDuration = Math.min(offeringMax, maxMonthsAllowedByProject);
  } else if (offeringMax) {
    // Only the offering has a limit
    trueMaxDuration = offeringMax;
  } else if (maxMonthsAllowedByProject) {
    // Only the project has a limit
    trueMaxDuration = maxMonthsAllowedByProject;
  } else {
    // Default fallback if no limits are set
    trueMaxDuration = 12;
  }

  // 4. Generate the options
  const min = component?.min_prepaid_duration || 1;
  // Ensure the loop doesn't run if the max duration is less than the min
  const max = Math.max(min, trueMaxDuration);

  const options = [];
  for (let i = min; i <= max; i++) {
    options.push({
      value: i,
      label: translate('{count} months', { count: i }),
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
  // A partial month at the end counts as a full month
  return Math.ceil(diff);
};

interface PrepaidFormContentProps {
  component: OfferingComponent;
  project: Project;
  // The start_date from the main form's state.
  startDate: string;
}

const PrepaidFormContent = ({
  component,
  project,
  startDate,
}: PrepaidFormContentProps) => {
  const { values } = useFormState();
  const selectedMonths = values.months;
  const customEndDate = values.end_date;

  // 1. Determine the effective start date for all calculations.
  // It's either the user-selected start date or today.
  const effectiveStartDate = useMemo(
    () => startDate || formatISODate(DateTime.now()),
    [startDate],
  );

  const monthOptions = useMemo(
    () => getMonthOptions(component, project, startDate),
    [component, project, startDate],
  );

  const isCustomRange = selectedMonths === 'custom';

  // 2. Calculate the end date based on the effective start date.
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

  // 3. Calculate duration based on the effective start date.
  const durationInMonths = useMemo(() => {
    if (isCustomRange && customEndDate) {
      return calculateMonthsDifference(effectiveStartDate, customEndDate);
    }
    return null;
  }, [isCustomRange, customEndDate, effectiveStartDate]);

  // 4. Calculate min/max dates for the custom date picker.
  const datePickerConstraints = useMemo(() => {
    const start = DateTime.fromISO(effectiveStartDate);
    const minDuration = component?.min_prepaid_duration || 1;
    const maxDuration = component?.max_prepaid_duration;

    const constraints: { minDate: string; maxDate?: string } = {
      minDate: start.plus({ months: minDuration }).toISODate(),
    };

    // The maximum selectable date is the EARLIEST of:
    // 1. The project's end date
    // 2. The start date + the offering's max duration
    const projectEndDate = project.end_date
      ? DateTime.fromISO(project.end_date)
      : null;
    const offeringMaxEndDate = maxDuration
      ? start.plus({ months: maxDuration })
      : null;

    if (projectEndDate && offeringMaxEndDate) {
      constraints.maxDate =
        projectEndDate < offeringMaxEndDate
          ? projectEndDate.toISODate()
          : offeringMaxEndDate.toISODate();
    } else if (projectEndDate) {
      constraints.maxDate = projectEndDate.toISODate();
    } else if (offeringMaxEndDate) {
      constraints.maxDate = offeringMaxEndDate.toISODate();
    }

    return constraints;
  }, [
    effectiveStartDate,
    project.end_date,
    component?.min_prepaid_duration,
    component?.max_prepaid_duration,
  ]);

  return (
    <>
      <div className="mb-4">
        <label className="form-label">{translate('Prepaid duration')}</label>
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
                // 5. "From" date is now dynamic.
                value={formatDate(effectiveStartDate)}
                disabled
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">{translate('To')}</label>
              {/* 6. DateField now has min and max date constraints. */}
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
  component: OfferingComponent;
  project: Project;
  onSubmit: (values: { end_date: string }) => void;
  resolve: () => void;
  // Pass the start_date from the main form's state.
  startDate?: string;
}

export const AddPrepaidPeriodDialog = ({
  component,
  project,
  onSubmit,
  resolve,
  startDate,
}: AddPrepaidPeriodDialogProps) => {
  const handleSubmit = (values) => {
    // 7. Use the effective start date for the final calculation.
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
        months: component?.min_prepaid_duration || 1,
      }}
    >
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add prepayment')}
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
            {/* 8. Pass start_date down to the content component. */}
            <PrepaidFormContent
              component={component}
              project={project}
              startDate={startDate}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
