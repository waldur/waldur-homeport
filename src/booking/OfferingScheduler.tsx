import { PlusCircleIcon, XIcon } from '@phosphor-icons/react';
import { DateTime, Duration } from 'luxon';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Button, Card } from 'react-bootstrap';
import { type DateTimePickerProps } from 'react-flatpickr';
import { usePrevious } from 'react-use';
import { Field, WrappedFieldArrayProps } from 'redux-form';

import { CustomRangeDatePicker } from '@waldur/booking/deploy/CustomRangeDatePicker';
import { BookingProps } from '@waldur/booking/types';
import { createBooking, getDurationOptions } from '@waldur/booking/utils';
import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { BusinessHoursGroup } from './components/BusinessHoursGroup';
import { SlotDurationGroup } from './components/SlotDurationGroup';
import { TimeZoneGroup } from './components/TimeZoneGroup';
import { WeekdaysGroup } from './components/WeekdaysGroup';
import { WeekendsGroup } from './components/WeekendsGroup';

import './OfferingScheduler.scss';

const INITIAL_CONFIG = {
  weekends: true,
  minTime: '00:00',
  maxTime: '24:00',
  slotDuration: '01:00:00',
  businessHours: {
    startTime: '00:00',
    endTime: '24:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },
};

type OfferingSchedulerProps = WrappedFieldArrayProps<BookingProps>;

const getDisabledRangeOfDates = (weekends, daysOfWeek) => {
  const disabledRanges: DateTimePickerProps['options']['disable'] = [];
  disabledRanges.push(function (date) {
    if (!weekends) {
      if (date.getDay() === 0 || date.getDay() === 6) {
        return true;
      }
    }
    return !daysOfWeek.includes(date.getDay());
  });
  return disabledRanges;
};

export const OfferingScheduler: FunctionComponent<OfferingSchedulerProps> = (
  props,
) => {
  const [weekends, setWeekends] = useState<boolean>(INITIAL_CONFIG.weekends);
  const [slotDuration, setSlotDuration] = useState<any>(
    INITIAL_CONFIG.slotDuration,
  );
  const [startTime, setStartTime] = useState<any>(
    INITIAL_CONFIG.businessHours.startTime,
  );
  const [endTime, setEndTime] = useState<any>(
    INITIAL_CONFIG.businessHours.endTime,
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    INITIAL_CONFIG.businessHours.daysOfWeek,
  );
  const [timeZone, setTimeZone] = useState<any>(DateTime.local().zoneName);

  const prevWeekends = usePrevious(weekends);

  const updateWeekends = useCallback(() => {
    if (prevWeekends === weekends) {
      return;
    }
    if (weekends) {
      if (!daysOfWeek.includes(0) || !daysOfWeek.includes(6)) {
        setDaysOfWeek(daysOfWeek.concat([0, 6]));
      }
    } else {
      if (daysOfWeek.includes(0) || daysOfWeek.includes(6)) {
        setDaysOfWeek(daysOfWeek.filter((day) => !(day === 0 || day === 6)));
      }
    }
  }, [weekends, daysOfWeek, setDaysOfWeek, prevWeekends]);

  useEffect(() => {
    updateWeekends();
  }, [updateWeekends, weekends]);

  const addRow = useCallback(() => {
    props.fields.push({} as any);
  }, [props.fields]);

  const durationSlot = useMemo(
    () =>
      Duration.fromISOTime(slotDuration || getDurationOptions()[0].value, {}),
    [slotDuration],
  );

  useEffect(() => {
    if (props.fields?.length === 0) {
      addRow();
    }
  }, [addRow]);

  const parseField = useCallback(
    (v: [Date, Date]) => {
      if (!v) return {};
      return createBooking(
        {
          start: v[0],
          end: v[1],
          allDay: true,
          extendedProps: {
            config: {
              weekends,
              slotDuration,
              businessHours: { startTime, endTime, daysOfWeek },
            },
            type: 'Availability',
          },
        },
        new Date().getTime().toString(),
      );
    },
    [weekends, slotDuration, startTime, endTime, daysOfWeek],
  );

  return (
    <>
      <Card className="card-bordered">
        <Card.Header>
          <Card.Title>
            <h3>{translate('Availability')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <BusinessHoursGroup
            startTime={startTime}
            endTime={endTime}
            setStartTime={setStartTime}
            setEndTime={setEndTime}
          />

          <WeekdaysGroup
            daysOfWeek={daysOfWeek}
            setDaysOfWeek={setDaysOfWeek}
          />

          <WeekendsGroup weekends={weekends} setWeekends={setWeekends} />
          <SlotDurationGroup
            slotDuration={slotDuration}
            setSlotDuration={setSlotDuration}
          />

          <TimeZoneGroup timeZone={timeZone} setTimeZone={setTimeZone} />
        </Card.Body>
      </Card>
      <>
        {props.fields.map((schedule, index) => (
          <div key={index} className="mb-6">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label>
                <b>{translate('Period {i}', { i: index + 1 })}:</b>&nbsp;
                {props.fields.get(index).start &&
                  props.fields.get(index).end && (
                    <span>
                      {parseDate(props.fields.get(index).start).toFormat(
                        'dd LLLL yyyy HH:mm',
                      )}
                      &nbsp;{translate('To')}&nbsp;
                      {parseDate(props.fields.get(index).end).toFormat(
                        'dd LLLL yyyy HH:mm',
                      )}
                    </span>
                  )}
              </label>
              <Button
                variant="light"
                className="btn-icon btn-active-light-danger"
                onClick={() => props.fields.remove(index)}
              >
                <span className="svg-icon svg-icon-2">
                  <XIcon weight="bold" />
                </span>
              </Button>
            </div>
            <Field
              name={schedule}
              component={CustomRangeDatePicker}
              options={{
                minDate: 'today',
                disable: getDisabledRangeOfDates(weekends, daysOfWeek),
                timeStep: durationSlot ? durationSlot.as('minutes') : 60,
              }}
              parse={parseField}
              format={(schedule) =>
                schedule.start ? [schedule.start, schedule.end] : []
              }
            />
          </div>
        ))}
        <Button variant="light" className="text-nowrap" onClick={addRow}>
          <span className="svg-icon svg-icon-2">
            <PlusCircleIcon weight="bold" />
          </span>
          {translate('Add time period')}
        </Button>
      </>
    </>
  );
};
