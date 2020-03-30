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
import { BookingProps, WaldurCalendarProps } from '@waldur/booking/types';
import { randomId } from '@waldur/core/fixtures';
import { withModal } from '@waldur/modal/withModal';

import { eventContentUi } from '../EventContentUi';
import { CalendarEventModal } from '../modal/CalendarEventModal';

import { defaultConfig } from './defaultConfig';

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
    } as BookingProps;
    this.props.addBooking(event);
  };

  handleEventClick = (arg: { event: EventApi; el: HTMLElement }) => {
    this.props.setModalProps({
      event: arg.event,
      destroy: () => this.handleEventRemoved(arg),
    });
    this.props.openModal((onSuccess: BookingProps) =>
      this.handleEventUpdate({ oldEvent: arg.event, event: onSuccess }),
    );
  };

  handleEventUpdate = ({
    event,
    oldEvent,
    prevEvent,
  }: {
    event: EventApi | BookingProps;
    prevEvent?: EventApi;
    oldEvent?: EventApi | BookingProps;
  }) => {
    const oldId = (prevEvent || oldEvent).extendedProps.uniqueID;
    this.props.updateBooking({ oldId, event });
  };

  handleEventRemoved = ({
    event,
    el,
  }: {
    event: EventApi;
    el: HTMLElement;
  }) => {
    const oldId = event.extendedProps.uniqueID;
    ReactDOM.unmountComponentAtNode(el);
    this.props.removeBooking(oldId);
  };

  handleEventRender = (arg: {
    el: HTMLElement;
    event: EventApi | BookingProps;
  }) => {
    if (arg.el.className.includes('fc-event')) {
      arg.el.setAttribute(
        'class',
        arg.el.className + ' booking booking-' + arg.event.id,
      );
      ReactDOM.render(eventContentUi(arg), arg.el);
      return arg.el;
    }
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
          event.className = 'booking';
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
        eventRender={this.handleEventRender}
        eventMouseEnter={arg =>
          arg.el.setAttribute('class', arg.el.className + ' booking-isHovered ')
        }
        eventMouseLeave={arg => arg.event.setProp('classNames', '')}
        eventSources={this.createEventSources({ schedules, bookings })}
        select={this.handleSelect}
        eventDrop={this.handleEventUpdate}
        eventResize={this.handleEventUpdate}
        eventClick={this.handleEventClick}
      />
    );
  }
}

const mapStateToProps = (state: { bookings: any }) => ({
  calendarState: state.bookings,
});

const mapDispatchToProps = dispatch => ({
  addBooking: (payload: BookingProps) => dispatch(addBooking(payload)),
  updateBooking: ({ oldId, event }) =>
    dispatch(updateBooking({ oldId, event })),
  removeBooking: (payload: string | number) => dispatch(removeBooking(payload)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withModal(CalendarEventModal),
);

const Calendar = enhance(PureCalendarComponent);

export default Calendar;
