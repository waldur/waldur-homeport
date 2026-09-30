import { DateTime } from 'luxon';
import { FunctionComponent, useCallback, useMemo } from 'react';

import { translate } from '@/i18n';

import { DateTimeRangeField } from './DateTimeRangeField';

interface RangeDateFieldProps {
  input: any;
  placeholder?: string;
  /** Open the calendar on mount — set by DateRangeFilter. */
  autoOpen?: boolean;
}

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
 * everything about the calendar lives in DateTimeRangeField.
 */
export const RangeDateField: FunctionComponent<RangeDateFieldProps> = ({
  input,
  placeholder,
  autoOpen,
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

  // Focus/blur are unused here: the filter drawer commits on change.
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
      // DateTimeRangeField floors at now because a maintenance window is
      // never scheduled backwards. A log filter is the opposite — it only ever
      // looks back.
      minDate={null}
      placeholder={placeholder || translate('Select date range')}
      autoOpen={autoOpen}
    />
  );
};
