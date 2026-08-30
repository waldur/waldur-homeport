import { get } from 'lodash-es';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';

import { formatDate, formatISODate } from '@/core/dateUtils';
import FormTable from '@/form/FormTable';
import { SelectField } from '@/form/select/SelectField';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { formatPrepaidMonthsCap } from '@/proposals/projectDuration';

import {
  PREPAID_DURATION_MONTHS,
  calculateMonthsDifference,
  getMonthOptions,
  getMonthsUntil,
  PrepaidConstraints,
  snapToOfferedMonths,
} from './prepaidConstraints';
import { PrepaidMonthsMode, usePrepaidMonthsMode } from './prepaidDurationMode';
import { Component } from './types';

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

const PrepaidEndDateSelector = ({
  constraints,
}: {
  constraints: PrepaidConstraints;
}) => {
  const form = useForm();
  const formData = useOrderFormData();
  const endDate = formData.attributes?.end_date;
  const startDate = formData.start_date;
  const project = formData.project;

  const effectiveStartDate = useMemo(
    () => startDate || formatISODate(DateTime.now()),
    [startDate],
  );

  const monthOptions = useMemo(
    () => getMonthOptions(constraints, project, startDate),
    [constraints, project, startDate],
  );

  const defaultMonths = constraints.min_prepaid_duration || 1;

  const [selectedMonths, setSelectedMonths] = useState<number>(defaultMonths);

  // Both the length and the date it comes to. The backend prices a prepaid
  // component by `prepaid_duration_months` when the order carries it, and only
  // falls back to measuring `end_date` against the day the order was created —
  // measured in UTC, on the server. An order placed in the evening east of UTC
  // put the two on different days, and a three-month subscription came to
  // three months and one day, rounded up and billed as four.
  const setPeriod = useCallback(
    (months: number) => {
      const newEnd = DateTime.fromISO(effectiveStartDate)
        .plus({ months })
        .toISODate();
      form.change('attributes.end_date', newEnd);
      form.change(`attributes.${PREPAID_DURATION_MONTHS}`, months);
    },
    [effectiveStartDate, form],
  );

  // Set default end_date on mount
  useEffect(() => {
    if (!endDate) {
      setPeriod(defaultMonths);
    }
  }, []);

  // Recalculate end_date when start date changes
  useEffect(() => {
    setPeriod(selectedMonths);
  }, [effectiveStartDate]);

  // Reset selected months if current selection is no longer valid
  useEffect(() => {
    if (monthOptions.length === 0) return;
    const validValues = monthOptions.map((opt) => opt.value);
    if (!validValues.includes(selectedMonths)) {
      const newMonths = validValues[0];
      setSelectedMonths(newMonths);
      setPeriod(newMonths);
    }
  }, [monthOptions]);

  const handleMonthChange = useCallback(
    (months: number) => {
      setSelectedMonths(months);
      setPeriod(months);
    },
    [setPeriod],
  );

  const dateRangeText = useMemo(() => {
    if (!endDate) return '';
    return `${formatDate(effectiveStartDate)} – ${formatDate(endDate)}`;
  }, [effectiveStartDate, endDate]);

  const durationText = useMemo(() => {
    if (!endDate) return '';
    const months = calculateMonthsDifference(effectiveStartDate, endDate);
    return months === 1
      ? translate('1 month')
      : translate('{count} months', { count: months });
  }, [effectiveStartDate, endDate]);

  return (
    <FormTable.Item
      label={translate('Subscription period')}
      value={
        <div>
          <div style={{ minWidth: 160 }}>
            <SelectFieldInline
              input={{
                value: selectedMonths,
                onChange: handleMonthChange,
              }}
              options={monthOptions}
            />
          </div>
          {endDate && (
            <div className="text-muted small mt-1">
              {dateRangeText} ({durationText})
            </div>
          )}
        </div>
      }
    />
  );
};

/** The same choice, kept as a number of months (see PrepaidMonthsMode). */
const PrepaidMonthsSelector = ({
  constraints,
  mode,
}: {
  constraints: PrepaidConstraints;
  mode: PrepaidMonthsMode;
}) => {
  const form = useForm();
  const { values } = useFormState({ subscription: { values: true } });
  const selectedMonths = get(values, mode.name);

  // Only lengths the call can accommodate: a fixed call duration caps the
  // options exactly as a project's end date does in the checkout.
  const monthOptions = useMemo(
    () =>
      getMonthOptions(
        constraints,
        mode.maxEndDate ? { end_date: mode.maxEndDate } : undefined,
      ),
    [constraints, mode.maxEndDate],
  );

  // The offering's minimum is a floor the builder will not go below, so a call
  // too short to hold it still offers it. Say so, rather than let the applicant
  // request a subscription that outlives the call without being told.
  const overrunsCall = useMemo(
    () =>
      Boolean(mode.maxEndDate) &&
      monthOptions.length > 0 &&
      monthOptions[0].value > getMonthsUntil(mode.maxEndDate),
    [monthOptions, mode.maxEndDate],
  );

  // Requests written before the switch carry an end date instead of a length.
  const storedEndDate = get(values, 'attributes.end_date');

  // Seed the field, and snap it back when the choice stops being offered.
  // Declared before the effect that clears the stored end date so that it still
  // sees it on the first commit — otherwise editing one of those requests would
  // reseed from nothing and shorten it to the offering's minimum.
  useEffect(() => {
    const offered = monthOptions.map((opt) => opt.value);
    const current = Number(selectedMonths);
    if (offered.includes(current)) return;
    const wanted =
      current > 0
        ? current
        : storedEndDate
          ? // Measured from today, as the cost estimate measures the very same
            // stored date; see computeRequestedCost.
            calculateMonthsDifference(
              formatISODate(DateTime.now()),
              storedEndDate,
            )
          : undefined;
    const snapped = snapToOfferedMonths(offered, wanted);
    if (snapped !== undefined) {
      form.change(mode.name, snapped);
    }
  }, [monthOptions, selectedMonths, storedEndDate, mode.name, form]);

  // The length is what the applicant chooses, but `attributes.end_date` is what
  // allocation reads: it converts that date back into a number of months and
  // re-anchors it from the request's creation date, precisely because review
  // outlasts drafting. Clearing the date would leave the backend with no period
  // at all, and a twelve-month subscription would be billed as one month.
  useEffect(() => {
    if (!selectedMonths) return;
    const endDate = DateTime.now()
      .plus({ months: Number(selectedMonths) })
      .toISODate();
    if (storedEndDate !== endDate) {
      form.change('attributes.end_date', endDate);
    }
  }, [selectedMonths, storedEndDate, form]);

  // Bare numbers: the label carries the unit.
  const selectOptions = useMemo(
    () =>
      monthOptions.map((opt) => ({
        value: opt.value,
        label: String(opt.value),
      })),
    [monthOptions],
  );

  return (
    <FormTable.Item
      // The unit is fixed, so it names the field rather than the value.
      label={translate('Subscription period (months)')}
      description={translate('Counted from the day the resource is granted.')}
      // The list is already filtered to what fits; the reason lives behind
      // the icon for whoever wonders why it is short.
      tooltip={
        mode.maxEndDate
          ? translate(
              'Only lengths that fit inside the fixed project duration are offered ({cap}).',
              {
                cap: formatPrepaidMonthsCap(
                  mode.maxMonths ?? getMonthsUntil(mode.maxEndDate),
                ),
              },
            )
          : undefined
      }
      value={
        <div>
          <div className="mw-200px">
            <Field name={mode.name}>
              {({ input, meta }) => (
                <SelectField
                  input={input}
                  meta={meta}
                  options={selectOptions}
                  simpleValue
                  isClearable={false}
                />
              )}
            </Field>
          </div>
          {overrunsCall && (
            <div className="text-warning small mt-1">
              {translate(
                'This offering cannot be subscribed to for less than {count} months, which is longer than the call allows.',
                { count: monthOptions[0].value },
              )}
            </div>
          )}
        </div>
      }
    />
  );
};

export const PrepaidDurationSelector = ({
  constraints,
  components,
}: {
  constraints: PrepaidConstraints;
  components: Component[];
}) => {
  const monthsMode = usePrepaidMonthsMode();

  if (components.length === 0) return null;

  return monthsMode ? (
    <PrepaidMonthsSelector constraints={constraints} mode={monthsMode} />
  ) : (
    <PrepaidEndDateSelector constraints={constraints} />
  );
};
