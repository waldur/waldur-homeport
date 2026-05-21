import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-final-form';

import { formatDate, formatISODate } from '@/core/dateUtils';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';

import {
  calculateMonthsDifference,
  getMonthOptions,
  PrepaidConstraints,
} from './prepaidConstraints';
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

export const PrepaidDurationSelector = ({
  constraints,
  components,
}: {
  constraints: PrepaidConstraints;
  components: Component[];
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

  // Set default end_date on mount
  useEffect(() => {
    if (!endDate) {
      const defaultEnd = DateTime.fromISO(effectiveStartDate)
        .plus({ months: defaultMonths })
        .toISODate();
      form.change('attributes.end_date', defaultEnd);
    }
  }, []);

  // Recalculate end_date when start date changes
  useEffect(() => {
    const newEnd = DateTime.fromISO(effectiveStartDate)
      .plus({ months: selectedMonths })
      .toISODate();
    form.change('attributes.end_date', newEnd);
  }, [effectiveStartDate]);

  // Reset selected months if current selection is no longer valid
  useEffect(() => {
    if (monthOptions.length === 0) return;
    const validValues = monthOptions.map((opt) => opt.value);
    if (!validValues.includes(selectedMonths)) {
      const newMonths = validValues[0];
      setSelectedMonths(newMonths);
      const newEnd = DateTime.fromISO(effectiveStartDate)
        .plus({ months: newMonths })
        .toISODate();
      form.change('attributes.end_date', newEnd);
    }
  }, [monthOptions]);

  const handleMonthChange = useCallback(
    (months: number) => {
      setSelectedMonths(months);
      const newEnd = DateTime.fromISO(effectiveStartDate)
        .plus({ months })
        .toISODate();
      form.change('attributes.end_date', newEnd);
    },
    [effectiveStartDate, form],
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

  if (components.length === 0) return null;

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
