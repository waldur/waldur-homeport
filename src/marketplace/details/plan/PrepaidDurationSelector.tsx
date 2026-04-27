import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { change } from 'redux-form';

import { formatDate, formatISODate } from '@/core/dateUtils';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { orderProjectSelector } from '@/marketplace/deploy/selectors';

import { ORDER_FORM_ID } from '../constants';

import {
  calculateMonthsDifference,
  getMonthOptions,
  PrepaidConstraints,
} from './prepaidConstraints';
import { Component } from './types';
import { getEndDate, getStartDate } from './utils';

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
  const dispatch = useDispatch();
  const endDate = useSelector(getEndDate);
  const startDate = useSelector(getStartDate);
  const project = useSelector(orderProjectSelector);

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
      dispatch(change(ORDER_FORM_ID, 'attributes.end_date', defaultEnd));
    }
  }, []);

  // Recalculate end_date when start date changes
  useEffect(() => {
    const newEnd = DateTime.fromISO(effectiveStartDate)
      .plus({ months: selectedMonths })
      .toISODate();
    dispatch(change(ORDER_FORM_ID, 'attributes.end_date', newEnd));
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
      dispatch(change(ORDER_FORM_ID, 'attributes.end_date', newEnd));
    }
  }, [monthOptions]);

  const handleMonthChange = useCallback(
    (months: number) => {
      setSelectedMonths(months);
      const newEnd = DateTime.fromISO(effectiveStartDate)
        .plus({ months })
        .toISODate();
      dispatch(change(ORDER_FORM_ID, 'attributes.end_date', newEnd));
    },
    [effectiveStartDate, dispatch],
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
