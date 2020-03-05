import { EventInput } from '@fullcalendar/core';
import * as moment from 'moment';
import * as React from 'react';
import {connect} from 'react-redux';
import { compose } from 'redux';
import {WrappedFieldArrayProps, formValueSelector} from 'redux-form';

import { AddCalendarEvent} from '@waldur/booking/components/AddCalendarEvent';
import {PureCalendar} from '@waldur/booking/components/calendar/PureCalendar';
import { CalendarSettings } from '@waldur/booking/components/CalendarSettings';
import { CalendarEventModal } from '@waldur/booking/components/modal/CalendarEventModal';
import {addBooking, removeBooking, setBookings, updateBooking} from '@waldur/booking/store/actions';
import {ConfigProps, State} from '@waldur/booking/store/types';
import { withTranslation, TranslateProps, translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { withModal } from '@waldur/modal/withModal';

import './OfferingScheduler.scss';

type OfferingSchedulerProps = TranslateProps & WrappedFieldArrayProps<any> & {
  setModalProps: (event) => void;
  openModal: (cb) => void;
  schedules: EventInput[];
  events: EventInput[];
  config: ConfigProps;
  calendar: State;
  addBooking: (payload: EventInput) => void;
  updateBooking: (payload: {event: EventInput, oldId: string}) => void;
  removeBooking: (id: number | string) => void;
  scheduleBooking: ({event: EventInput}) => void;
  removeSchedule: ({event: EventInput}) => void;
  updateScheduledBooking: (payload) => void;
  setBooking: (bookings) => void;
};

export const PureOfferingScheduler = (props: OfferingSchedulerProps) => {
  const {config, schedules} = props.calendar;
  return (
    <div className="col-sm-12">

      <FormGroup classNameWithoutLabel="p-h-m col-sm-10 col-lg-8 col-centered">
        <h3 className="header-bottom-border">{translate('Booking configuration')}</h3>
        <CalendarSettings />
      </FormGroup>

      <h3 className="p-h-m col-sm-8 col-centered header-bottom-border">
        {translate('Booking availability ')}
      </h3>
      <FormGroup classNameWithoutLabel="col-sm-8 col-centered">
        <AddCalendarEvent
          useTime={false}
          showAllDay={false}
          event={{
            id: 'config',
            type: 'availability',
            constraint: 'businessHours',
            // allDay: true,
            start: moment().format('MM-DD-YYYY'),
            end: moment().add(1, 'day').format('MM-DD-YYYY'),
            extendedProps: {config},
          }}
          setBooking={event => {
            if (schedules.filter(item => item.id === event.id).length > 0) {
              const formID = props.fields.getAll().findIndex(item => item.id === event.id);
              props.fields.remove(formID);
              props.fields.push(event);
              props.updateScheduledBooking({event, oldId: event.id});
            } else {
              props.fields.push(event);
              props.scheduleBooking({event});
            }
          }}
        />
      </FormGroup>

      <FormGroup classNameWithoutLabel="p-h-m col-sm-10 col-centered">
        <PureCalendar
          calendarType="create"
          calendar={{bookings: props.fields.getAll(), schedules, config}}
          onSelectDate={event => {
            props.fields.push({...event, config});
            props.scheduleBooking({event: { ...event, config}});
          }}
          onEventClick={({event, oldId, formID}) => {
            props.setModalProps({
              event,
              deleteBooking: () => {
                props.fields.remove(formID);
                props.removeSchedule(oldId);
                },
            });
            props.openModal(onSuccess => {
              props.fields.remove(formID);
              props.fields.push(onSuccess);
              props.updateScheduledBooking(onSuccess);
            });
          }}
          updateCallback={payload => {
            props.fields.remove(payload.formID);
            props.fields.push(payload.event);
            props.updateScheduledBooking(payload);
          }}
        />
      </FormGroup>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  setBooking: e => dispatch(setBookings(e)),
  scheduleBooking: payload => dispatch(addBooking(payload.event)),
  removeSchedule: oldId => dispatch(removeBooking(oldId)),
  updateScheduledBooking: payload => dispatch(updateBooking(payload)),
});

const mapStateToProps = state => ({
  schedules: formValueSelector('marketplaceOfferingCreate')(state, 'schedules'),
  calendar: state.calendar,
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
  withModal(CalendarEventModal),
);

export const OfferingScheduler = enhance(PureOfferingScheduler);
