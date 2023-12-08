import { padStart, clone } from 'lodash';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ListGroup } from 'react-bootstrap';
import Flatpickr, { DateTimePickerProps } from 'react-flatpickr';

import { parseDate } from '@waldur/core/dateUtils';
import { FormField } from '@waldur/form/types';
import { translate } from '@waldur/i18n';

import { getTimeOptions } from '../utils';

import './CustomRangeDatePicker.scss';

interface Time {
  h: string;
  m: string;
}

const isSameMonth = (date1: Date, date2: Date) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth();

const pad2 = (value: string | number) => padStart(String(value), 2, '0');

interface CustomRangeDatePickerProps extends FormField {
  options?: {
    minDate?: DateTimePickerProps['options']['minDate'];
    maxDate?: DateTimePickerProps['options']['maxDate'];
    enable?: Array<{ from: string; to: string }>;
    disable?: Array<{ from: string; to: string } | ((date: Date) => boolean)>;
    /** In minutes */
    timeStep?: number;
    hasTimePicker?: boolean;
  };
}

export const CustomRangeDatePicker = (props: CustomRangeDatePickerProps) => {
  const { input } = props;

  const onChange = useCallback(
    (d1: Date, d2: Date, t1: Time, t2: Time) => {
      const newValue: Date[] = clone(input.value);

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

  const refDate1 = useRef<Flatpickr>();
  const refDate2 = useRef<Flatpickr>();

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

  const nextMonthDate = useMemo(
    () => DateTime.now().plus({ months: 1 }).toJSDate(),
    [],
  );

  const onCalendar1Change = useCallback(
    (c1: Flatpickr['flatpickr']) => {
      const c2 = refDate2?.current?.flatpickr;
      if (!c2) return;
      if (c1.config.maxDate) {
        const maxDate = c1.config.maxDate;
        if (
          maxDate.getFullYear() === c1.currentYear &&
          maxDate.getMonth() === c1.currentMonth
        ) {
          c1.changeMonth(-1);
        }
      }
      const c2m = c2.currentMonth;
      const c2y = c2.currentYear;
      if (c2y > c1.currentYear) return;
      else if (c2y === c1.currentYear && c2m <= c1.currentMonth) {
        if (c1.currentMonth === 11) {
          c2.changeYear(c1.currentYear + 1);
          c2.changeMonth(0, false);
        } else {
          c2.changeMonth(c1.currentMonth + 1, false);
        }
      } else if (c2y < c1.currentYear) {
        if (c1.currentMonth === 11) {
          c2.changeYear(c1.currentYear + 1);
          c2.changeMonth(0, false);
        } else {
          c2.changeYear(c1.currentYear);
          c2.changeMonth(c1.currentMonth + 1, false);
        }
      }
    },
    [refDate2?.current],
  );

  const onCalendar2Change = useCallback(
    (c2: Flatpickr['flatpickr']) => {
      const c1 = refDate1?.current?.flatpickr;
      if (!c1) return;
      if (c2.config.minDate) {
        const minDate = c2.config.minDate;
        if (
          minDate.getFullYear() === c2.currentYear &&
          minDate.getMonth() === c2.currentMonth
        ) {
          c2.changeMonth(1);
        }
      }
      const c1m = c1.currentMonth;
      const c1y = c1.currentYear;
      if (c1y < c2.currentYear) return;
      else if (c1y === c2.currentYear && c1m >= c2.currentMonth) {
        if (c2.currentMonth === 0) {
          c1.changeYear(c2.currentYear - 1);
          c1.changeMonth(11, false);
        } else {
          c1.changeMonth(c2.currentMonth - 1, false);
        }
      } else if (c1y > c2.currentYear) {
        if (c2.currentMonth === 0) {
          c1.changeYear(c2.currentYear - 1);
          c1.changeMonth(11, false);
        } else {
          c1.changeYear(c2.currentYear);
          c1.changeMonth(c2.currentMonth - 1, false);
        }
      }
    },
    [refDate1?.current],
  );

  // Fix the calendars month & year position on component ready (useful for edit functionality)
  useEffect(() => {
    if (input.value?.length === 2) {
      const dates: Date[] = input.value;
      const c1 = refDate1?.current?.flatpickr;
      const c2 = refDate2?.current?.flatpickr;
      if (c2) c2.setDate(dates);
      if (c1) c1.setDate(dates);
      // first, align the 2nd calendar (important)
      if (c2) {
        c2.changeYear(dates[1].getFullYear());
        c2.changeMonth(dates[1].getMonth(), false);

        if (isSameMonth(dates[0], dates[1])) {
          // on calendar 2, go to next month
          c2.changeMonth(1);
        }
      }
      if (c1) {
        c1.changeYear(dates[0].getFullYear());
        c1.changeMonth(dates[0].getMonth(), false);
      }
    }
  }, []);

  return (
    <div className="flatpickr-range-custom">
      <div className="flatpickr-range-date-1">
        <div className="flatpickr-range-title">
          <label>{translate('From date')}</label>
          {input.value[0] && (
            <span>
              {DateTime.fromJSDate(input.value[0]).toLocaleString(
                DateTime.DATE_FULL,
              )}
            </span>
          )}
        </div>
        <Flatpickr
          ref={refDate1}
          options={{
            dateFormat: 'Y-m-d',
            inline: true,
            mode: 'range',
            locale: {
              firstDayOfWeek: 0, // start week on Sunday
            },
            ...props.options,
          }}
          value={null}
          className="form-control"
          onChange={(_dates, _, self) => {
            if (_dates[0]) {
              const firstTime = getFirstAvailableTimeOfDay(_dates[0]);
              _dates[0] = parseDate(_dates[0])
                .set({ hour: +firstTime.h, minute: +firstTime.m })
                .toJSDate();
            }
            if (_dates.length === 2) {
              const lastTime = getLastAvailableTimeOfDay(_dates[1]);
              const second = lastTime.m === '59' ? 59 : 0;
              _dates[1] = parseDate(_dates[1])
                .set({ hour: +lastTime.h, minute: +lastTime.m, second })
                .toJSDate();

              onChange(_dates[0], _dates[1], null, null);
            }
            const c2 = refDate2?.current?.flatpickr;
            if (!c2) return;

            const c2CurrentMonth = c2.currentMonth;
            const c2CurrentYear = c2.currentYear;
            self.setDate(_dates, false);
            c2.setDate(_dates, false);

            c2.changeYear(c2CurrentYear);
            c2.changeMonth(c2CurrentMonth, false);
          }}
          onMonthChange={(_dates, _, self) => onCalendar1Change(self)}
          onYearChange={(_dates, _, self) => onCalendar1Change(self)}
        />
      </div>
      <div className="flatpickr-range-date-2">
        <div className="flatpickr-range-title">
          <label>{translate('End date')}</label>
          {input.value[1] && (
            <span>
              {DateTime.fromJSDate(input.value[1]).toLocaleString(
                DateTime.DATE_FULL,
              )}
            </span>
          )}
        </div>
        <Flatpickr
          ref={refDate2}
          options={{
            dateFormat: 'Y-m-d',
            inline: true,
            mode: 'range',
            defaultDate: nextMonthDate,
            locale: {
              firstDayOfWeek: 0, // start week on Sunday
            },
            ...props.options,
          }}
          value={null}
          className="form-control"
          onChange={(_dates, _, self) => {
            if (_dates[0]) {
              const firstTime = getFirstAvailableTimeOfDay(_dates[0]);
              _dates[0] = parseDate(_dates[0])
                .set({ hour: +firstTime.h, minute: +firstTime.m })
                .toJSDate();
            }
            if (_dates.length === 2) {
              const lastTime = getLastAvailableTimeOfDay(_dates[1]);
              const second = lastTime.m === '59' ? 59 : 0;
              _dates[1] = parseDate(_dates[1])
                .set({ hour: +lastTime.h, minute: +lastTime.m, second })
                .toJSDate();

              onChange(_dates[0], _dates[1], null, null);
            }
            const c1 = refDate1?.current?.flatpickr;
            if (!c1) return;

            const c1CurrentMonth = c1.currentMonth;
            const c1CurrentYear = c1.currentYear;
            self.setDate(_dates, false);
            c1.setDate(_dates, false);

            c1.changeYear(c1CurrentYear);
            c1.changeMonth(c1CurrentMonth, false);
          }}
          onMonthChange={(_dates, _, self) => onCalendar2Change(self)}
          onYearChange={(_dates, _, self) => onCalendar2Change(self)}
        />
      </div>

      {/* Time */}
      {props.options.hasTimePicker && (
        <div className="flatpickr-range-time">
          <div className="flatpickr-range-time-1">
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
          <div className="flatpickr-range-time-2">
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
