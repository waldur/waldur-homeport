import { EventInput } from '@fullcalendar/core';
import * as React from 'react';
import DatePicker from 'react-16-bootstrap-date-picker';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { WrappedFieldArrayProps, formValueSelector } from 'redux-form';

import { EditableCalendar } from '@waldur/booking/components/calendar/EditableCalendar';
import { CalendarEventModal } from '@waldur/booking/components/modal/CalendarEventModal';
import { createCalendarBookingEvent, deleteCalendarBookingEvent } from '@waldur/booking/utils';;
import { TimeSelectField } from '@waldur/form-react/TimeSelectField';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { withModal } from '@waldur/modal/withModal';

import { FormGroup } from '../FormGroup';
import './OfferingScheduler.scss';

type OfferingSchedulerProps =
  TranslateProps &
  WrappedFieldArrayProps<any> &
  {
    setModalProps: (event) => void;
    openModal: (cb) => void;
    schedules: EventInput[];
  };

interface WorkingHoursProps {
  minTime: string;
  maxTime: string;
}

const TimeSelectFieldInput = props => (
  <>
    <label className="col-sm-2 control-label" htmlFor={`workingHours-${props.name}`}>
      {props.label}
    </label>
    <TimeSelectField
      className="col-sm-4"
      interval={props.interval || 30}
      searchable={false}
      id={`workingHours-${props.name}`}
      input={{
        value: props.value,
        onChange: val => props.onChange(
          pS => ({ ...pS, [props.name]: val })
        ),
      }}
    />
  </>
);

const separator = (
  <div style={{margin: '50px 0', position: 'relative'}}>
    <span style={{
      backgroundColor: 'white',
      padding: '0 16px',
      position: 'absolute',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
    }}>
      <strong>OR</strong><br />
      select availability range from calendar below
    </span>
    <hr />
  </div>
);

export const PureOfferingScheduler = (props: OfferingSchedulerProps) => {
  const [start, setStart] = React.useState<Date>();
  const [end, setEnd] = React.useState<Date>();
  const [weekends, setWeekends] = React.useState<boolean>(true);
  const [workingHours, setWorkingHours] = React.useState<WorkingHoursProps>({
    minTime: '00:00',
    maxTime: '24:00',
  });

  return (
    <div className="form-group ">
      <Col smOffset={2} sm={8}>
        <Panel>
          <Panel.Heading>
            <h4>{props.translate('Availability')}</h4>
          </Panel.Heading>
          <Panel.Body>

            <FormGroup label={'Start'} valueClassName="col-sm-8" description="Availability starting date">
              <DatePicker name="start" value={start} onChange={val => setStart(val)}/>
            </FormGroup>
            <FormGroup label={'End'} valueClassName="col-sm-8" description="Availability ending date">
              <DatePicker name="end" value={end} onChange={val => setEnd(val)}/>
            </FormGroup>

            <FormGroup label={'Working hours'} description="Availability starting date">
              <TimeSelectFieldInput label="from" name="minTime" value={workingHours.minTime} onChange={setWorkingHours}/>
              <TimeSelectFieldInput label="till" name="maxTime" value={workingHours.maxTime} onChange={setWorkingHours}/>
            </FormGroup>

            <FormGroup label="Include weekends" valueClassName="checkbox-toggle">
              <input type="checkbox" id="weekendsToggle" checked={weekends} onChange={() => setWeekends(!weekends)}/>
              <label style={{marginTop: '5px'}} htmlFor="weekendsToggle">Toggle weekends</label>
            </FormGroup>

            {separator}

            <EditableCalendar
              weekends={weekends}
              workingHours={workingHours}
              events={props.schedules}
              onSelectDate={event => props.fields.push(createCalendarBookingEvent({ ...event, type: 'availability' }) )}
              onSelectEvent={prevEvent => {
                props.setModalProps({
                  event: prevEvent.event,
                  destroy: () => deleteCalendarBookingEvent(props.fields, prevEvent.event),
                });
                props.openModal(event => {
                  const field = createCalendarBookingEvent({ ...prevEvent.event.extendedProps, event });
                  deleteCalendarBookingEvent(props.fields, prevEvent.event);
                  props.fields.push(field);
                });
              }}
              eventResize={slot => {
                const field = createCalendarBookingEvent(slot.event);
                deleteCalendarBookingEvent(props.fields, slot.prevEvent);
                props.fields.push(field);
              }}
              eventDrop={slot => {
                const field = createCalendarBookingEvent(slot.event);
                deleteCalendarBookingEvent(props.fields, slot.oldEvent);
                props.fields.push(field);
              }}
            />
          </Panel.Body>
        </Panel>
      </Col>
    </div>
  );
};

const mapStateToProps = state => ({
  schedules: formValueSelector('marketplaceOfferingCreate')(state, 'schedules'),
});

const enhance = compose(
  connect(mapStateToProps),
  withTranslation,
  withModal(CalendarEventModal)
);

export const OfferingScheduler = enhance(PureOfferingScheduler);
