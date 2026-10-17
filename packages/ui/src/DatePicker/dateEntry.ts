import { DateTime } from 'luxon';
import { translate } from 'waldur-i18n-runtime';

import { DateBound, checkBounds } from './dateBounds';
import { DateMask, MASK_FORMATS, MASK_HINTS, parseEntry } from './maskedDate';

export type EntryResult =
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'ok'; value: DateTime; hasTime: boolean };

interface EntryRules {
  minDate?: DateBound;
  maxDate?: DateBound;
  /** When given, only days matching at least one predicate are accepted. */
  enable?: Array<(date: Date) => boolean>;
}

/** The message for an entry that does not read as a date. */
const invalidEntryMessage = (mask: DateMask) =>
  (mask === 'month'
    ? translate('Enter a month as {format}.', { format: MASK_HINTS.month })
    : mask === 'datetime'
      ? translate('Enter a date as {format}, optionally with a time.', {
          format: MASK_HINTS.datetime,
        })
      : translate('Enter a date as {format}.', {
          format: MASK_HINTS.date,
        })) as string;

/**
 * Reads a typed entry and checks it against the same rules the calendar
 * applies (bounds, `enable`). A refusal carries the message to show; the
 * entry itself is left for the caller to keep on screen.
 */
export const validateEntry = (
  text: string,
  mask: DateMask,
  { minDate, maxDate, enable }: EntryRules = {},
): EntryResult => {
  const parsed = parseEntry(text, mask);
  if (parsed.status === 'empty') return parsed;
  if (parsed.status === 'invalid') {
    return { status: 'error', message: invalidEntryMessage(mask) };
  }
  const unit = mask === 'month' ? 'month' : parsed.hasTime ? 'minute' : 'day';
  const outside = checkBounds(parsed.value, minDate, maxDate, unit);
  if (outside) {
    const shown = outside.bound.toFormat(
      MASK_FORMATS[
        unit === 'month' ? 'month' : unit === 'minute' ? 'datetime' : 'date'
      ],
    );
    return {
      status: 'error',
      message: (unit === 'month'
        ? outside.side === 'min'
          ? translate('Enter a month on or after {month}.', { month: shown })
          : translate('Enter a month on or before {month}.', { month: shown })
        : outside.side === 'min'
          ? translate('Enter a date on or after {date}.', { date: shown })
          : translate('Enter a date on or before {date}.', {
              date: shown,
            })) as string,
    };
  }
  if (
    enable?.length &&
    !enable.some((match) => match(parsed.value.startOf('day').toJSDate()))
  ) {
    return {
      status: 'error',
      message: translate('This date is not available.') as string,
    };
  }
  return { status: 'ok', value: parsed.value, hasTime: parsed.hasTime };
};
