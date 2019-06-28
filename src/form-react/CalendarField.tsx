import * as React from 'react';
import { FieldArray, WrappedFieldArrayProps } from 'redux-form';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { eventsMapper, createCalendarBookingEvent } from '@waldur/booking/utils';
import { Event } from '@waldur/events/types';

import { FormField } from './types';

interface CalendarFieldProps extends FormField {
  name: string;
  excludedEvents?: Event[];
}

export class CalendarComponent extends React.Component<WrappedFieldArrayProps<any> & CalendarFieldProps> {

  state = {
    view: {
      type: undefined,
    },
  };

  render() {
    const { props } = this;
    let events = props.fields.getAll();
    if (!events) {
      return null;
    }
    events = eventsMapper([...props.excludedEvents, ...events]);
    return (
      <Calendar
        editable={true}
        defaultView={this.state.view.type}
        selectable={true}
        eventResizableFromStart={true}
        events={events}
        viewSkeletonRender={({view}) => {
          if (view.type !== this.state.view.type) {
            this.setState({ view });
          }
        }}
        select={event => {
          const field = createCalendarBookingEvent(event);
          props.fields.push(field);
        }}/>
    );
  }
}

export const CalendarField = (props: CalendarFieldProps) => (
  <FieldArray
    name={props.name}
    component={CalendarComponent}
    {...props}
  />
);
