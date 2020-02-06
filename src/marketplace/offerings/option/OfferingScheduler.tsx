import { EventInput } from '@fullcalendar/core';
import * as React from 'react';
import DatePicker from 'react-16-bootstrap-date-picker';
import * as Panel from 'react-bootstrap/lib/Panel';
import { connect } from 'react-redux';
import Select from 'react-select';
import { compose } from 'redux';
import { WrappedFieldArrayProps, formValueSelector } from 'redux-form';

import { EditableCalendar } from '@waldur/booking/components/calendar/EditableCalendar';
import { CalendarEventModal } from '@waldur/booking/components/modal/CalendarEventModal';
import { createCalendarBookingEvent, deleteCalendarBookingEvent } from '@waldur/booking/utils';
import { getOptions } from '@waldur/form-react/TimeSelectField';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { withModal } from '@waldur/modal/withModal';

import './OfferingScheduler.scss';

type OfferingSchedulerProps =
  TranslateProps &
  WrappedFieldArrayProps<any> &
  {
    setModalProps: (event) => void;
    openModal: (cb) => void;
    schedules: EventInput[];
  };

const TimeSelectFieldInput = props => (
  <>
    {props.label && <label className="col-sm-1 control-label" htmlFor={`workingHours-${props.name}`}>{props.label}</label>}
    <Select
      className="col-sm-4"
      name={props.name}
      simpleValue={true}
      searchable={false}
      options={getOptions(props.interval || 30)}
      value={props.value}
      onChange={value => props.onChange(
        prevState => ({ ...prevState, [props.name]: value })
      )}
    />
  </>
);

interface WorkingHoursProps {
  minTime: string;
  maxTime: string;
}

export const PureOfferingScheduler = (props: OfferingSchedulerProps) => {
  const [start, setStart] = React.useState<Date>();
  const [end, setEnd] = React.useState<Date>();
  const previousValues = React.useRef({ start, end });

  const [isFirst, setIsFirst] = React.useState<boolean>(false);
  const [weekends, setWeekends] = React.useState<boolean>(true);
  const [workingHours, setWorkingHours] = React.useState<WorkingHoursProps>({
    minTime: '00:00', maxTime: '24:00',
  });

  React.useEffect(() => {
    if (previousValues.current.start !== start && previousValues.current.end !== end) {
      previousValues.current = { start, end };
      const field = createCalendarBookingEvent({
        id: 'single-entity',
        type: 'availability',
        title: 'Availability',
        start, end, weekends, workingHours,
      });
      if (isFirst) {
        deleteCalendarBookingEvent(props.fields, {id: 'single-entity'});
      }
      props.fields.push(field);
      setIsFirst(true);
    }
  });

  return (
    <div className="form-group">
      <FormGroup
        label="Single select"
        labelClassName="control-label col-sm-2"
        valueClassName="col-sm-8"
        description="Allow bookings to be scheduled at weekends">
        <Panel>
          <Panel.Heading>
            <h3>Schedule availability</h3>
          </Panel.Heading>
          <Panel.Body>
            <FormGroup
              label={'Start date'}
              labelClassName="control-label col-sm-3"
              valueClassName="col-sm-6">
              <DatePicker id="availabilityStart" name="start" value={start} onChange={val => setStart(val)}/>
            </FormGroup>
            <FormGroup
              label={'End date'}
              labelClassName="control-label col-sm-3"
              valueClassName="col-sm-6">
              <DatePicker id="availabilityEnd" name="end" value={end} onChange={val => setEnd(val)}/>
            </FormGroup>
            <FormGroup
              label={'Working hours'}
              labelClassName="control-label col-sm-3"
              description="Daily available booking time range">
              <TimeSelectFieldInput name="minTime" value={workingHours.minTime} onChange={setWorkingHours}/>
              <TimeSelectFieldInput label="to" name="maxTime" value={workingHours.maxTime} onChange={setWorkingHours}/>
            </FormGroup>
            <FormGroup
              label="Include weekends"
              labelClassName="control-label col-sm-3"
              valueClassName="col-sm-offset-1 checkbox-toggle"
              description="Allow bookings to be scheduled at weekends">
              <input type="checkbox" id="weekendsToggle" checked={weekends} onChange={() => setWeekends(!weekends)}/>
              <label style={{marginTop: 5, marginLeft: 30}} htmlFor="weekendsToggle">Toggle weekends</label>
            </FormGroup>
            <button
              className="btn btn-primary pull-right"
              onClick={() => props.fields.push(createCalendarBookingEvent({
                start, end, title: 'Availability', id: 7357, type: 'availability',
              }))}>
              Confirm
            </button>
          </Panel.Body>
        </Panel>
      </FormGroup>

      <div className="form-group">
        <div className="col-sm-push-2 col-sm-8 component-separator">
          <span><h3>OR <br /> select availability range from calendar below</h3></span>
          <hr />
        </div>
      </div>

      <FormGroup
        label="Multi select"
        labelClassName="control-label col-sm-2"
        valueClassName="col-sm-8"
        description="Select custom dates for availability">
        <Panel>
          <Panel.Heading>
            <h3>Schedule multiple availability</h3>
          </Panel.Heading>
          <Panel.Body>
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
      </FormGroup>
    </div>
  );
};

const mapStateToProps = state => ({
  schedules: formValueSelector('marketplaceOfferingCreate')(state, 'schedules'),
});

const enhance = compose(
  connect(mapStateToProps),
  withTranslation,
  withModal(CalendarEventModal),
);

export const OfferingScheduler = enhance(PureOfferingScheduler);
