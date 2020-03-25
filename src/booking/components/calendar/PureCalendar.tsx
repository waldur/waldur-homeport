import bootstrapPlugin from '@fullcalendar/bootstrap';
import { EventApi, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import momentPlugin from '@fullcalendar/moment';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';

import {
  addBooking,
  updateBooking,
  removeBooking,
} from '@waldur/booking/store/actions';
import { BookingProps, State } from '@waldur/booking/types';
import { randomId } from '@waldur/core/fixtures';
import { withModal } from '@waldur/modal/withModal';

import { CalendarEventModal } from '../modal/CalendarEventModal';

import { defaultConfig } from './defaultConfig';

interface WaldurCalendarProps {
  calendarType: 'create' | 'edit' | 'read';
  calendarState: State;

  setBookings: (payload: BookingProps[]) => void;
  addBooking: (payload: BookingProps) => void;
  updateBooking: (payload: {
    oldId: string;
    event: BookingProps | EventApi;
  }) => void;
  removeBooking: (oldId: string) => void;

  setModalProps: (props) => void;
  openModal: (cb) => void;
  getAllEvents: (cb) => void;
}

class PureCalendarComponent extends React.Component<
  WaldurCalendarProps,
  FullCalendar
> {
  calendarComponentRef = React.createRef<FullCalendar>();

  handleSelect = arg => {
    const { allDay, startStr, start, endStr, end } = arg;
    const event = {
      start: allDay ? startStr : start,
      end: allDay ? endStr : end,
      id: this.props.calendarType === 'create' ? 'Availability' : 'Schedule',
      allDay,
      extendedProps: {
        uniqueID: `${randomId()}-${arg.jsEvent.timeStamp}`,
      },
    };
    this.props.addBooking(event);
  };

  handleEventClick = arg => {
    this.props.setModalProps({
      event: arg.event,
      destroy: () => this.handleEventRemoved(arg),
    });
    this.props.openModal(onSuccess =>
      this.handleEventUpdate(arg.event, onSuccess),
    );
  };

  handleEventUpdate = (oldBooking: EventApi, newBooking: EventApi) => {
    const oldId = oldBooking.extendedProps.uniqueID;
    this.props.updateBooking({ oldId, event: newBooking });
  };

  handleEventRemoved = ({ event, el }) => {
    const oldId = event.extendedProps.uniqueID;
    ReactDOM.unmountComponentAtNode(el);
    this.props.removeBooking(oldId);
  };

  createEventSources = ({ schedules, bookings }) => [
    {
      events: this.props.calendarType === 'create' ? schedules : bookings,
      editable: false,
      selectable: false,
      eventDataTransform: (event: EventInput) => {
        if (event.id === 'Availability') {
          event.rendering = 'background';
          event.overlap = true;
        } else if (event.id === 'Schedule') {
          event.overlap = false;
          event.constraint = 'Availability';
        }
        return event;
      },
    },
    {
      events: schedules,
      selectable: true,
      editable: true,
      eventDataTransform: (event: EventInput) => {
        if (event.id === 'Availability') {
          event.rendering = undefined;
        } else if (event.id === 'Schedule') {
          event.overlap = false;
          event.constraint = 'Availability';
        } else {
          return null;
        }
        return event;
      },
    },
  ];

  componentWillUnmount() {
    const getApi = this.calendarComponentRef.current.getApi();
    getApi.removeAllEventSources();
    getApi.destroy();
  }

  render() {
    console.log(this.props);
    const { config, schedules, bookings } = this.props.calendarState;
    return (
      <FullCalendar
        ref={this.calendarComponentRef}
        {...defaultConfig}
        {...config}
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          bootstrapPlugin,
          momentTimezonePlugin,
          momentPlugin,
          listPlugin,
        ]}
        selectable={true}
        eventLimit={false}
        height="auto"
        eventOverlap={false}
        eventStartEditable={true}
        eventSources={this.createEventSources({ schedules, bookings })}
        select={this.handleSelect}
        eventDrop={({ oldEvent, event }) =>
          this.handleEventUpdate(oldEvent, event)
        }
        eventResize={({ prevEvent, event }) =>
          this.handleEventUpdate(prevEvent, event)
        }
        eventClick={this.handleEventClick}
      />
    );
  }
}

const mapStateToProps = state => ({
  calendarState: state.bookings,
});

const mapDispatchToProps = dispatch => ({
  addBooking: (payload: BookingProps) => dispatch(addBooking(payload)),
  updateBooking: ({ oldId, event }) =>
    dispatch(updateBooking({ oldId, event })),
  removeBooking: payload => dispatch(removeBooking(payload)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withModal(CalendarEventModal),
);

const Calendar = enhance(PureCalendarComponent);

export default Calendar;
