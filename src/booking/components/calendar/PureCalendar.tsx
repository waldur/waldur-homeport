import bootstrapPlugin from '@fullcalendar/bootstrap';
import { EventApi, View } from '@fullcalendar/core';
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
import { BookingProps, WaldurCalendarProps } from '@waldur/booking/types';
import {
  mapBookingEvents,
  handleTitle,
  handleTime,
} from '@waldur/booking/utils';
import { randomId } from '@waldur/core/fixtures';
import { withModal } from '@waldur/modal/withModal';

import { CalendarEventModal } from '../modal/CalendarEventModal';

import { defaultConfig } from './defaultConfig';

type Updater = {
  event: EventApi | BookingProps;
  oldEvent?: EventApi | BookingProps;
  prevEvent?: EventApi;
};
type Remover = {
  el: HTMLElement;
  event: EventApi | BookingProps;
};

class PureCalendarComponent extends React.Component<WaldurCalendarProps> {
  calendarComponentRef = React.createRef<FullCalendar>();

  handleSelect = arg => {
    const { allDay, startStr, start, endStr, end } = arg;
    const event = {
      start: allDay ? startStr : start,
      end: allDay ? endStr : end,
      allDay,
      id: `${randomId()}-${arg.jsEvent.timeStamp}`,
      title: '',
      extendedProps: {
        type:
          this.props.calendarType === 'create' ? 'Availability' : 'Schedule',
      },
    } as BookingProps;
    this.props.addBooking(event);
  };

  handleEventClick = arg => {
    this.props.setModalProps({
      event: arg.event,
      destroy: () => {
        this.handleEventRemoved(arg);
        arg.event.remove();
      },
    });
    this.props.openModal((cb: BookingProps) => {
      const { extendedProps, id } = arg.event;
      this.props.updateBooking({
        oldID: id,
        event: { id, extendedProps, ...cb },
      });
    });
  };

  handleEventUpdate = ({ event, oldEvent, prevEvent }: Updater) => {
    const oldID = (prevEvent && prevEvent.id) || (oldEvent && oldEvent.id);
    this.props.updateBooking({ oldID, event });
  };

  handleEventRemoved = ({ event, el }: Remover) => {
    this.props.removeBooking(event.id);
    ReactDOM.unmountComponentAtNode(el);
  };

  handleEventRender = (arg: {
    el: HTMLElement;
    event: EventApi;
    view: View;
  }) => {
    if (arg.el && arg.el.classList.contains('fc-event')) {
      if (arg.view.type === 'dayGridMonth') {
        handleTime(arg);
        handleTitle(arg);
      }
      return arg.el;
    }
  };

  createEventSources = () => [
    {
      events: mapBookingEvents(this.props.calendarState.bookings, 'background'),
      editable: false,
      selectable: false,
    },
    {
      events: mapBookingEvents(this.props.calendarState.schedules),
      selectable: true,
      editable: true,
    },
  ];

  componentWillUnmount() {
    this.props.getAllEvents;
    const getApi = this.calendarComponentRef.current.getApi();
    getApi.removeAllEventSources();
    getApi.destroy();
  }

  render() {
    return (
      <FullCalendar
        ref={this.calendarComponentRef}
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          bootstrapPlugin,
          momentTimezonePlugin,
          momentPlugin,
          listPlugin,
        ]}
        {...defaultConfig}
        {...this.props.calendarState.config}
        height="auto"
        progressiveEventRendering={true}
        eventSources={this.createEventSources()}
        eventRender={this.handleEventRender}
        select={this.handleSelect}
        eventDrop={this.handleEventUpdate}
        eventResize={this.handleEventUpdate}
        eventClick={this.handleEventClick}
        eventMouseEnter={({ event }) => {
          if (!event.classNames.includes('isHovered')) {
            event.setProp(
              'classNames',
              ` fc-event-${event.extendedProps.type} isHovered `,
            );
          }
        }}
        eventMouseLeave={({ event }) => {
          if (event.classNames.includes('isHovered')) {
            event.setProp(
              'classNames',
              ` fc-event-${event.extendedProps.type} `,
            );
          }
        }}
      />
    );
  }
}

const mapStateToProps = state => ({
  calendarState: state.bookings,
});

const mapDispatchToProps = dispatch => ({
  addBooking: payload => dispatch(addBooking(payload)),
  updateBooking: payload => dispatch(updateBooking(payload)),
  removeBooking: payload => dispatch(removeBooking(payload)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withModal(CalendarEventModal),
);

const Calendar = enhance(PureCalendarComponent);

export default Calendar;
