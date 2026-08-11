import { DateTime } from 'luxon';
import { FunctionComponent, useCallback, useMemo } from 'react';

import { translate } from '@/i18n';

import { DateTimeRangeField } from './DateTimeRangeField';

interface RangeDateFieldProps {
  input: any;
  placeholder?: string;
}

// Stable empty-value reference. Flatpickr re-applies its `value` prop (calling
// setDate, which clears an in-progress selection) whenever the reference
// changes, so the empty state must always be the same array instance.
const EMPTY_VALUE: Date[] = [];

const noop = () => undefined;

/**
 * Adapter over DateTimeRangeField storing `{ min, max }` as ISO date strings.
 *
 * The value shape deliberately mirrors RangeNumberField rather than
 * DateTimeRangeField's `[Date, Date]`: the generated table filters map
 * `.min`/`.max` onto a pair of query params, and the backend parses bare
 * dates (`DateFilter` with `date__gte`/`date__lte`), so time would be
 * discarded anyway. That mapping is the whole reason this component exists —
 * everything about driving Flatpickr lives in DateTimeRangeField.
 */
export const RangeDateField: FunctionComponent<RangeDateFieldProps> = ({
  input,
  placeholder,
}) => {
  const { onChange, value: inputValue } = input;

  const value = useMemo(() => {
    const min = inputValue?.min;
    const max = inputValue?.max;
    if (!min && !max) return EMPTY_VALUE;
    return [min, max]
      .filter(Boolean)
      .map((iso: string) => DateTime.fromISO(iso).toJSDate());
  }, [inputValue?.min, inputValue?.max]);

  // Stable across renders: DateTimeRangeField keys its Flatpickr options memo
  // on this identity, and a fresh function each render would tear down and
  // rebuild the calendar mid-selection.
  const handleChange = useCallback(
    (dates?: Date[]) => {
      onChange(
        dates
          ? {
              min: DateTime.fromJSDate(dates[0]).toISODate(),
              max: DateTime.fromJSDate(dates[1]).toISODate(),
            }
          : undefined,
      );
    },
    [onChange],
  );

  // Focus/blur are unused here: the filter drawer commits on change, and
  // Flatpickr's own input is read-only.
  const adaptedInput = useMemo(
    () => ({
      name: input.name,
      value,
      onChange: handleChange,
      onBlur: noop,
      onFocus: noop,
    }),
    [input.name, value, handleChange],
  );

  return (
    <DateTimeRangeField
      input={adaptedInput}
      // The backend filters on bare dates, so collecting a time would promise
      // a precision the query throws away.
      enableTime={false}
      // DateTimeRangeField floors at today because a maintenance window is
      // never scheduled backwards. A log filter is the opposite — it only ever
      // looks back.
      minDate={null}
      placeholder={placeholder || translate('Select date range')}
    />
  );
};
