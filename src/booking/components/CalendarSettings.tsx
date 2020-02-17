import * as moment from 'moment';
import * as React from 'react';
import {useDispatch} from 'react-redux';

import {TimeSelectField} from '@waldur/booking/components/TimeSelectField';
import {setSettings} from '@waldur/booking/store/actions';
import {Tooltip} from '@waldur/core/Tooltip';
import {translate} from '@waldur/i18n';
import {FormGroup} from '@waldur/marketplace/offerings/FormGroup';

const days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarSettings: React.FC = () => {
  const [weekends, setWeekends] = React.useState<boolean>(true);
  const [minTime, setMinTime] = React.useState<string>(moment().startOf('day').format('HH:mm'));
  const [maxTime, setMaxTime] = React.useState<string>(moment().endOf('day').format('HH:mm'));
  const [daysOfWeek, setDaysOfWeek] = React.useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
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
        businessHours: {
          startTime: minTime,
          endTime: maxTime,
          daysOfWeek,
        },
      };
      dispatch(setSettings(config));
    },
    [weekends, minTime, maxTime, daysOfWeek]
  );

  return (
    <>
      <FormGroup
        label={translate('Business hours')}
        labelClassName="control-label col-sm-3"
        description={translate('Daily available booking time range')}>
        <TimeSelectField label="from" name="minTime" value={minTime} onChange={setMinTime}/>
        <TimeSelectField label="till" name="maxTime" value={maxTime} onChange={setMaxTime}/>
      </FormGroup>

      <FormGroup
        label={translate('Include weekends')}
        labelClassName="control-label col-sm-3"
        valueClassName="col-sm-9"
        description={translate('Allow bookings to be scheduled at weekends')}>
        <div className="checkbox-toggle col-centered">
          <input type="checkbox" id="weekendsToggle" checked={weekends} onChange={() => setWeekends(!weekends)}/>
          <label style={{margin: '5px 0 0 30px'}} htmlFor="weekendsToggle">Toggle weekends</label>
        </div>
      </FormGroup>

      <FormGroup
        label={translate('Select available weekdays')}
        labelClassName="control-label col-sm-3"
        valueClassName="col-sm-9 weekDays-selector"
        description={translate('Allow bookings to be scheduled at weekends')}>
        {
          days.map((day, index) => (
            <Tooltip label={day} id={`weekday-${day}`}>
              <input
                type="checkbox"
                value={index}
                id={`weekday-${day}`}
                checked={daysOfWeek.includes(index)}
                onChange={handle}
                className="weekday"/>
              <label htmlFor={`weekday-${day}`}>{day[0].toUpperCase()}</label>
            </Tooltip>
          ))
        }
      </FormGroup>

      <FormGroup
        label={translate('Time slot')}
        labelClassName="control-label col-sm-3"
        valueClassName="col-sm-9"
        description={translate('Booking time slot duration')}>
        <TimeSelectField interval={60} label="from" name="minTime" value={minTime} onChange={setMinTime}/>
      </FormGroup>
    </>
  );
};
