import * as moment from 'moment-timezone';
import * as React from 'react';
import {useDispatch} from 'react-redux';
import Select, { Options } from 'react-select';

import {TimeSelectField} from '@waldur/booking/components/TimeSelectField';
import {setSettings} from '@waldur/booking/store/actions';
import {Tooltip} from '@waldur/core/Tooltip';
import {translate} from '@waldur/i18n';
import {FormGroup} from '@waldur/marketplace/offerings/FormGroup';
import {startOfSecond} from '@fullcalendar/core/datelib/marker';
import {minutesToHours} from '@waldur/core/utils';

const timeZoneArray = moment.tz.names().map(zone => ({value: zone, label: zone}));
const daysArray = [1, 2, 3, 4, 5, 6, 0];
const timeMinutes = [ 30, 60, 120, 180, 240, 300, 360, 420, 480, 1439 ];

const getDayLabel = (d: number): string => moment.weekdays(d);

const timeSlotOptions = timeMinutes.map(time => {
  const mTime = moment.duration({minute: time});
  return {
    value: moment.utc(mTime.asMilliseconds()).format('HH:mm'),
    label: mTime.humanize(),
  };
});

const handleWeekDays = (arr, e): number[] => {
  const intVal = parseInt(e.target.value, null);
  if (arr.includes(intVal)) {
    return (arr.filter(item => item !== intVal));
  } else {
    return (arr.concat(intVal));
  }
};

export const CalendarSettings: React.FC = () => {
  const [weekends, setWeekends] = React.useState<boolean>(true);
  const [minTime, setMinTime] = React.useState<string>('00:00');
  const [maxTime, setMaxTime] = React.useState<string>('24:00');
  const [daysOfWeek, setDaysOfWeek] = React.useState<number[]>(daysArray);
  const [slotDuration, setSlotDuration] = React.useState<string>('00:30');
  const [startTime, setStartTime] = React.useState<string>(moment().startOf('day').format('HH:mm'));
  const [endTime, setEndTime] = React.useState<string>(moment().startOf('day').format('HH:mm'));
  const [hiddenDays, setHiddenDays] = React.useState<number[]>([]);
  const [timeZone, setTimeZone] = React.useState<string>(moment.tz.guess());
  const dispatch = useDispatch();

  React.useLayoutEffect(
    () => {
      const config = {
        weekends,
        hiddenDays,
        minTime,
        maxTime,
        slotDuration,
        businessHours: {daysOfWeek, startTime, endTime },
      };
      dispatch(setSettings(config));
    },
    [weekends, minTime, maxTime, daysOfWeek, slotDuration, timeZone, hiddenDays]
  );

  return (
    <>
      <FormGroup
        label={translate('Business hours')}
        labelClassName="control-label col-sm-3"
        description={translate('Daily available booking time range')}>
        <TimeSelectField label="from" name="minTime" value={startTime} onChange={setStartTime}/>
        <TimeSelectField label="till" name="maxTime" value={endTime} onChange={setEndTime}/>
      </FormGroup>

      <FormGroup
        label={translate('Include weekends')}
        labelClassName="control-label col-sm-3"
        description={translate('Allow bookings to be scheduled at weekends')}>
        <div className="checkbox-toggle">
          <input type="checkbox" id="weekendsToggle" checked={weekends} onChange={() => setWeekends(!weekends)}/>
          <label htmlFor="weekendsToggle">Toggle weekends</label>
        </div>
      </FormGroup>

      <FormGroup
        label={translate('Select available weekdays')}
        labelClassName="control-label col-sm-3"
        valueClassName={'col-sm-7'}
        description={translate('Allow bookings to be scheduled at selected weekends')}>
        <div className="weekDays-selector" style={{margin: '5px 20px', display: 'flex', justifyContent: 'space-between'}}>
          {daysArray.map(day => (
            <Tooltip label={getDayLabel(day)} id={`weekday-${day}`}>
              <input
                type="checkbox"
                id={`weekday-${day}`}
                className="weekday"
                value={day}
                checked={daysOfWeek.includes(day)}
                onChange={e => setDaysOfWeek(handleWeekDays(daysOfWeek, e))}/>
              <label htmlFor={`weekday-${day}`}>{getDayLabel(day)[0]}</label>
            </Tooltip>
          ))}
        </div>
      </FormGroup>

      <FormGroup
        label={translate('Hidden days')}
        labelClassName="control-label col-sm-3"
        valueClassName={'col-sm-7'}>
        <div className="weekDays-selector" style={{margin: '5px 20px', display: 'flex', justifyContent: 'space-between'}}>
          {daysArray.map(day => (
            <Tooltip label={getDayLabel(day)} id={`weekday-${day}`}>
              <input
                type="checkbox"
                id={`hidden-weekday-${day}`}
                className="weekday"
                value={day}
                checked={hiddenDays.includes(day)}
                onChange={e => setHiddenDays(handleWeekDays(hiddenDays, e))}/>
              <label htmlFor={`hidden-weekday-${day}`}>{getDayLabel(day)[0]}</label>
            </Tooltip>
          ))}
        </div>
      </FormGroup>

      <FormGroup
        label={translate('Time slot')}
        labelClassName="control-label col-sm-3"
        valueClassName={'col-sm-7'}
        description={translate('Minimum booking time slot duration.')}>
        <Select
          name="timeSlotSelect"
          simpleValue={true}
          searchable={false}
          clearable={false}
          options={timeSlotOptions}
          value={slotDuration}
          onChange={(newValue: Options) => setSlotDuration(newValue)}
        />
      </FormGroup>

      <FormGroup
        label={translate('Time zone')}
        labelClassName="control-label col-sm-3"
        valueClassName={'col-sm-7'}>
        <Select
          name="timeZone"
          simpleValue={true}
          searchable={true}
          clearable={false}
          options={timeZoneArray}
          value={timeZone}
          onChange={(newValue: Options) => setTimeZone(newValue)}
        />
      </FormGroup>
    </>
  );
};
