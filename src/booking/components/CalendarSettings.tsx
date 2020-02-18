import * as moment from 'moment';
import * as React from 'react';
import {useDispatch} from 'react-redux';
import Select, { Options } from 'react-select';

import {TimeSelectField} from '@waldur/booking/components/TimeSelectField';
import {setSettings} from '@waldur/booking/store/actions';
import {Tooltip} from '@waldur/core/Tooltip';
import {translate} from '@waldur/i18n';
import {FormGroup} from '@waldur/marketplace/offerings/FormGroup';

const daysArray = [1, 2, 3, 4, 5, 6, 0];
const timeSlotHours = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 24 ];

const getDayLabel = (d: number): string => moment.weekdays(d);
const timeSlotOptions = timeSlotHours.map(time => ({
  value: time,
  label: moment.duration(time, 'hour').humanize(),
}));

export const CalendarSettings: React.FC = () => {
  const [weekends, setWeekends] = React.useState<boolean>(true);
  const [minTime, setMinTime] = React.useState<string>(moment().startOf('day').format('HH:mm'));
  const [maxTime, setMaxTime] = React.useState<string>(moment().endOf('day').format('HH:mm'));
  const [daysOfWeek, setDaysOfWeek] = React.useState<number[]>(daysArray);
  const [slotDuration, setSlotDuration] = React.useState<any>(0.5);
  const dispatch = useDispatch();

  const handle = e => {
    const intVal = parseInt(e.target.value, null);
    if (daysOfWeek.includes(intVal)) {
      setDaysOfWeek(daysOfWeek.filter(item => item !== intVal));
    } else {
      setDaysOfWeek(daysOfWeek.concat(intVal));
    }
  };

  React.useEffect(
    () => {
      const config = {
        weekends,
        minTime,
        maxTime,
        slotDuration: moment(slotDuration, 'hours').format('HH:mm'),
        businessHours: {
          startTime: minTime,
          endTime: maxTime,
          daysOfWeek,
        },
      };
      dispatch(setSettings(config));
    },
    [weekends, minTime, maxTime, daysOfWeek, slotDuration]
  );

  return (
    <>
      <FormGroup
        label={translate('Business hours')}
        labelClassName="control-label col-sm-4"
        description={translate('Daily available booking time range')}>
        <TimeSelectField label="from" name="minTime" value={minTime} onChange={setMinTime}/>
        <TimeSelectField label="till" name="maxTime" value={maxTime} onChange={setMaxTime}/>
      </FormGroup>

      <FormGroup
        label={translate('Include weekends')}
        labelClassName="control-label col-sm-4"
        description={translate('Allow bookings to be scheduled at weekends')}>
        <div className="checkbox-toggle">
          <input type="checkbox" id="weekendsToggle" checked={weekends} onChange={() => setWeekends(!weekends)}/>
          <label style={{margin: '5px 0 0 30px'}} htmlFor="weekendsToggle">Toggle weekends</label>
        </div>
      </FormGroup>

      <FormGroup
        label={translate('Select available weekdays')}
        labelClassName="control-label col-sm-4"
        description={translate('Allow bookings to be scheduled at weekends')}>
        <div className="weekDays-selector" style={{margin: '5px 20px', display: 'flex', justifyContent: 'space-between'}}>
          {daysArray.map(day => (
            <Tooltip label={getDayLabel(day)} id={`weekday-${day}`}>
              <input
                type="checkbox"
                id={`weekday-${day}`}
                className="weekday"
                value={day}
                checked={daysOfWeek.includes(day)}
                onChange={handle}/>
              <label htmlFor={`weekday-${day}`}>{getDayLabel(day)[0]}</label>
            </Tooltip>
          ))}
        </div>
      </FormGroup>

      <FormGroup
        label={translate('Time slot')}
        labelClassName="control-label col-sm-4"
        description={translate('Booking time slot duration')}>
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
    </>
  );
};
