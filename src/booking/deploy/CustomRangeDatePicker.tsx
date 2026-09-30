import { padStart } from 'lodash-es';
import { DateTime } from 'luxon';
import { useCallback, useMemo, useState } from 'react';
import { ListGroup } from 'react-bootstrap';

import {
  Calendar,
  DateBound,
  Matcher,
  boundsToDisabled,
  boundsToMonths,
  useCalendarLocale,
} from 'waldur-ui';

import { parseDate } from '@/core/dateUtils';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';

import { getTimeOptions } from '../utils';

import './CustomRangeDatePicker.scss';

interface Time {
  h: string;
  m: string;
}

const pad2 = (value: string | number) => padStart(String(value), 2, '0');

type DayRange = { from: DateBound; to: DateBound };

interface CustomRangeDatePickerProps extends FormField {
  options?: {
    minDate?: DateBound;
    maxDate?: DateBound;
    /** Availability windows: only days they touch are selectable. */
    enable?: Array<{ from: string; to: string }>;
    disable?: Array<DayRange | ((date: Date) => boolean)>;
    /** In minutes */
    timeStep?: number;
    hasTimePicker?: boolean;
  };
}

const startOfDay = (value: DateBound) => parseDate(value as any).startOf('day');

/** Days a `{from, to}` window touches, inclusive of both ends. */
const touchesDay = (range: DayRange, day: Date) => {
  const d = DateTime.fromJSDate(day);
  return d >= startOfDay(range.from) && d <= startOfDay(range.to);
};

const toDisabledMatchers = (
  options: CustomRangeDatePickerProps['options'] = {},
): Matcher[] => {
  const matchers = boundsToDisabled(options.minDate, options.maxDate);
  if (options.enable) {
    const enable = options.enable;
    matchers.push((day: Date) => !enable.some((r) => touchesDay(r, day)));
  }
  for (const rule of options.disable ?? []) {
    matchers.push(
      typeof rule === 'function' ? rule : (day: Date) => touchesDay(rule, day),
    );
  }
  return matchers;
};

/**
 * Booking periods: two months side by side ("From date" / "End date"),
 * picking a start then an end day, plus optional start/end time lists.
 * A range defaults to the first and last available time of its days (the
 * whole days when there are no availability windows).
 */
export const CustomRangeDatePicker = (props: CustomRangeDatePickerProps) => {
  const { input } = props;
  const locale = useCalendarLocale();
  const [draftStart, setDraftStart] = useState<Date | undefined>();

  const onChange = useCallback(
    (d1: Date, d2: Date, t1: Time, t2: Time) => {
      // Copies: the Dates in form state must not be mutated in place.
      const newValue: Date[] = (input.value || []).map(
        (date: Date) => new Date(date),
      );

      if (d1) {
        newValue[0] = d1;
      }
      if (d2) {
        newValue[1] = d2;
      }

      if (t1 && newValue[0]) {
        if (t1.h === '23' && t1.m === '59') {
          newValue[0].setHours(23, 59, 59);
        } else {
          newValue[0].setHours(Number(t1.h), Number(t1.m));
        }
      }
      if (t2 && newValue[1]) {
        if (t2.h === '24' && t2.m === '59') {
          newValue[1].setHours(23, 59, 59);
        } else {
          newValue[1].setHours(Number(t2.h), Number(t2.m));
        }
      }

      if (newValue.length !== 2) {
        input.onChange(undefined);
      } else {
        input.onChange(newValue);
      }
    },
    [input.value, input.onChange],
  );

  const startTime: Time = useMemo(() => {
    const v0 = input.value[0];
    if (v0) {
      return {
        h: pad2(v0.getHours()),
        m: pad2(v0.getMinutes()),
      };
    } else {
      return { h: '00', m: '00' };
    }
  }, [input.value]);
  const endTime: Time = useMemo(() => {
    const v1 = input.value[1];
    if (v1) {
      return {
        h: pad2(v1.getHours()),
        m: pad2(v1.getMinutes()),
      };
    } else {
      return { h: '23', m: '59' };
    }
  }, [input.value]);

  const getFirstAvailableTimeOfDay = useCallback(
    (date: any): Time => {
      const _date = parseDate(date);
      for (const free of props.options.enable || []) {
        const from = parseDate(free.from);
        // TODO: Maybe we have 2 or more free slots in one day with different hours
        if (from.hasSame(_date, 'day')) {
          return { h: pad2(from.hour), m: pad2(from.minute) };
        }
      }
      return { h: '00', m: '00' };
    },
    [props.options.enable],
  );

  const getLastAvailableTimeOfDay = useCallback(
    (date: any): Time => {
      const _date = parseDate(date);
      for (const free of props.options.enable || []) {
        const to = parseDate(free.to);
        // TODO: Maybe we have 2 or more free slots in one day with different hours
        if (to.hasSame(_date, 'day')) {
          return { h: pad2(to.hour), m: pad2(to.minute) };
        }
      }
      return { h: '23', m: '59' };
    },
    [props.options.enable],
  );

  const isTimeOfStartDisabled = useCallback(
    (time: Time) => {
      if (input.value?.length !== 2) return true;
      const d1 = parseDate(input.value[0]);
      const d2 = parseDate(input.value[1]);
      if (d1.hasSame(d2, 'day')) {
        if (+time.h > +endTime.h) return true;
        else if (+time.h === +endTime.h && +time.m >= +endTime.m) return true;
      }
      // Search in enable datetimes
      const d = d1.set({ hour: +time.h, minute: +time.m });
      return !(props.options.enable || []).some((free) => {
        const from = parseDate(free.from);
        const to = parseDate(free.to);
        return (d > from || d.equals(from)) && d < to;
      });
    },
    [input.value, props.options.enable, endTime],
  );

  const isTimeOfEndDisabled = useCallback(
    (time: Time) => {
      if (input.value?.length !== 2) return true;
      const d1 = parseDate(input.value[0]);
      const d2 = parseDate(input.value[1]);
      if (d2.hasSame(d1, 'day')) {
        if (+time.h < +startTime.h) return true;
        else if (+time.h === +startTime.h && +time.m <= +startTime.m)
          return true;
      }
      // Search in enable datetimes
      const d = d2.set({ hour: +time.h, minute: +time.m });
      return !(props.options.enable || []).some((free) => {
        const from = parseDate(free.from);
        const to = parseDate(free.to);
        return d > from && (d < to || d.equals(to));
      });
    },
    [input.value, props.options.enable, startTime],
  );

  const handleDayClick = (day: Date, modifiers: Record<string, boolean>) => {
    if (modifiers.disabled) return;
    if (!draftStart) {
      setDraftStart(day);
      return;
    }
    const [first, second] =
      day < draftStart ? [day, draftStart] : [draftStart, day];
    const firstTime = getFirstAvailableTimeOfDay(first);
    const lastTime = getLastAvailableTimeOfDay(second);
    const start = parseDate(first)
      .set({ hour: +firstTime.h, minute: +firstTime.m, second: 0 })
      .toJSDate();
    const end = parseDate(second)
      .set({
        hour: +lastTime.h,
        minute: +lastTime.m,
        second: lastTime.m === '59' ? 59 : 0,
      })
      .toJSDate();
    setDraftStart(undefined);
    input.onChange([start, end]);
  };

  const disabledDays = useMemo(
    () => toDisabledMatchers(props.options),
    [props.options],
  );

  const value: Date[] = input.value || [];

  return (
    <div className="booking-range-picker">
      <div className="booking-range-picker-dates">
        <div className="booking-range-picker-titles">
          <div className="booking-range-picker-title">
            <label>{translate('From date')}</label>
            {value[0] && (
              <span>
                {DateTime.fromJSDate(value[0]).toLocaleString(
                  DateTime.DATE_FULL,
                )}
              </span>
            )}
          </div>
          <div className="booking-range-picker-title">
            <label>{translate('End date')}</label>
            {value[1] && (
              <span>
                {DateTime.fromJSDate(value[1]).toLocaleString(
                  DateTime.DATE_FULL,
                )}
              </span>
            )}
          </div>
        </div>
        <Calendar
          mode="range"
          numberOfMonths={2}
          // Each month's trailing days are the next month's own; showing
          // them twice reads as a second selection.
          showOutsideDays={false}
          selected={
            draftStart
              ? { from: draftStart, to: undefined }
              : { from: value[0], to: value[1] }
          }
          onSelect={() => undefined}
          onDayClick={handleDayClick}
          defaultMonth={value[0]}
          weekStartsOn={0}
          locale={locale}
          disabled={disabledDays}
          {...boundsToMonths(props.options?.minDate, props.options?.maxDate)}
        />
      </div>

      {/* Time */}
      {props.options.hasTimePicker && (
        <div className="booking-range-picker-time">
          <div className="booking-range-picker-time-list">
            <div className="title">
              <h6>{translate('Start time')}</h6>
              {startTime && (
                <span>
                  {startTime.h}:{startTime.m}
                </span>
              )}
            </div>
            <ListGroup>
              {getTimeOptions(props.options.timeStep)
                .slice(0, -1)
                .map((time, i) => (
                  <ListGroup.Item
                    key={i}
                    type="button"
                    action
                    variant=""
                    active={startTime.h === time.h && startTime.m === time.m}
                    disabled={isTimeOfStartDisabled(time)}
                    onClick={() => onChange(null, null, time, null)}
                  >
                    {time.h}:{time.m}
                  </ListGroup.Item>
                ))}
            </ListGroup>
          </div>
          <div className="booking-range-picker-time-list">
            <div className="title">
              <h6>{translate('End time')}</h6>
              {endTime && (
                <span>
                  {endTime.h}:{endTime.m}
                </span>
              )}
            </div>
            <ListGroup>
              {getTimeOptions(props.options.timeStep)
                .slice(1)
                .map((time, i) => (
                  <ListGroup.Item
                    key={i}
                    type="button"
                    action
                    variant=""
                    active={endTime.h === time.h && endTime.m === time.m}
                    disabled={isTimeOfEndDisabled(time)}
                    onClick={() => onChange(null, null, null, time)}
                  >
                    {time.h}:{time.m}
                  </ListGroup.Item>
                ))}
            </ListGroup>
          </div>
        </div>
      )}
    </div>
  );
};
