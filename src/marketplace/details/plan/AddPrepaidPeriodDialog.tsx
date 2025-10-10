import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { Form, Field, useFormState } from 'react-final-form';

import { formatDate, formatISODate } from '@waldur/core/dateUtils';
import { SubmitButton } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { SelectField } from '@waldur/form/SelectField';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

const getMonthOptions = (minDuration?: number, maxDuration?: number) => {
  const min = minDuration || 1;
  const max = maxDuration || 12;

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

const calculateEndDate = (months: number): string => {
  return DateTime.now().plus({ months }).toISODate();
};

const calculateMonthsDifference = (
  startDate: string,
  endDate: string,
): number => {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);

  return Math.round(end.diff(start, 'months').months);
};

const PrepaidFormContent = ({ component }) => {
  const { values } = useFormState();
  const selectedMonths = values.months;
  const customEndDate = values.end_date;

  const monthOptions = useMemo(
    () =>
      getMonthOptions(
        component?.min_prepaid_duration,
        component?.max_prepaid_duration,
      ),
    [component?.min_prepaid_duration, component?.max_prepaid_duration],
  );

  const isCustomRange = selectedMonths === 'custom';
  const today = formatISODate(DateTime.now());

  const prepaidEndDate = useMemo(() => {
    if (isCustomRange && customEndDate) {
      return customEndDate;
    } else if (typeof selectedMonths === 'number') {
      return calculateEndDate(selectedMonths);
    }
    return null;
  }, [isCustomRange, customEndDate, selectedMonths]);

  const durationInMonths = useMemo(() => {
    if (isCustomRange && customEndDate) {
      return calculateMonthsDifference(today, customEndDate);
    }
    return null;
  }, [isCustomRange, customEndDate, today]);

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
                value={formatDate(today)}
                disabled
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">{translate('To')}</label>
              <Field name="end_date" component={DateField} minDate={today} />
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
          {translate('Prepayment until: {date}', {
            date: formatDate(prepaidEndDate),
          })}
        </p>
      ) : null}
    </>
  );
};

export const AddPrepaidPeriodDialog = ({ component, onSubmit, resolve }) => {
  const handleSubmit = (values) => {
    const endDate =
      values.months === 'custom'
        ? values.end_date
        : calculateEndDate(values.months);

    onSubmit({ end_date: endDate });
    resolve();
  };

  return (
    <Form onSubmit={handleSubmit}>
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add prepayment')}
            footer={
              <>
                <CloseDialogButton className="flex-grow-1" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-grow-1"
                />
              </>
            }
          >
            <PrepaidFormContent component={component} />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
