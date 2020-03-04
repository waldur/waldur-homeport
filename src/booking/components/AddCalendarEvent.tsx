import {EventInput} from '@fullcalendar/core/structs/event';
import * as React from 'react';
import {FieldArrayFieldsProps} from 'redux-form';

import {PureDateField} from '@waldur/booking/components/PureDateField';
import {FormGroup} from '@waldur/marketplace/offerings/FormGroup';

interface AddCalendarEventProps {
  event: EventInput;
  useTime?: boolean;
  showAllDay?: boolean;
  formEvents?: FieldArrayFieldsProps<any>;
  setBooking?: (event: EventInput) => void;
}

export const AddCalendarEvent: React.FC<AddCalendarEventProps> = props => {
  const [start, setStart] = React.useState(props.event.start);
  const [end, setEnd] = React.useState(props.event.end);
  const [allDay, setAllDay] = React.useState(props.event.allDay);
  const prevValue = React.useRef({start, end});

  React.useEffect(() => {
    if (prevValue.current.start !== start && prevValue.current.end !== end) {
      const event = { ...props.event, start, end, allDay };
      props.setBooking(event);
    }
    }, [start, end, allDay]
  );

  return (
    <>
      <FormGroup classNameWithoutLabel={'col-sm-12'}>
        <PureDateField
          name={'start'}
          label={'Start'}
          className={'col-md-4'}
          value={start}
          onChange={setStart}
          withTime={props.useTime ? { isDisabled: allDay } : false}
        />
        <PureDateField
          name={'end'}
          label={'End'}
          className={'col-md-4'}
          value={end}
          onChange={setEnd}
          withTime={props.useTime ? { isDisabled: allDay } : false}/>
      </FormGroup>
      {
        props.showAllDay && <FormGroup label="All Day" labelClassName="control-label col-xs-2" valueClassName="col-centered">
          <div className="checkbox-toggle">
            <input id="All-Day-toggle" type="checkbox" checked={allDay} onChange={() => setAllDay(!allDay)}/>
            <label style={{marginTop: 5, marginLeft: 30}} htmlFor="All-Day-toggle">Allday weekends</label>
          </div>
        </FormGroup>
      }
      {props.children}
      </>
  );
};
