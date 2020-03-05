import { EventInput } from '@fullcalendar/core';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { WrappedFieldArrayProps, formValueSelector } from 'redux-form';

import { EditableCalendar } from '@waldur/booking/components/calendar/EditableCalendar';
import { CalendarEventModal } from '@waldur/booking/components/modal/CalendarEventModal';
import {
  createCalendarBookingEvent,
  deleteCalendarBookingEvent,
} from '@waldur/booking/utils';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { withModal } from '@waldur/modal/withModal';

import './OfferingScheduler.scss';

type OfferingSchedulerProps = TranslateProps &
  WrappedFieldArrayProps<any> & {
    setModalProps: (event) => void;
    openModal: (cb) => void;
    schedules: EventInput[];
  };

export const PureOfferingScheduler = (props: OfferingSchedulerProps) => (
  <div className="form-group ">
    <Col smOffset={2} sm={8}>
      <Panel>
        <Panel.Heading>
          <h4>{props.translate('Availability')}</h4>
        </Panel.Heading>
        <Panel.Body>
          <EditableCalendar
            events={props.schedules}
            onSelectDate={event =>
              props.fields.push(
                createCalendarBookingEvent({ ...event, type: 'availability' }),
              )
            }
            onSelectEvent={prevEvent => {
              props.setModalProps({
                event: prevEvent.event,
                destroy: () =>
                  deleteCalendarBookingEvent(props.fields, prevEvent.event),
              });
              props.openModal(event => {
                const field = createCalendarBookingEvent({
                  ...prevEvent.event.extendedProps,
                  event,
                });
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

const mapStateToProps = state => ({
  schedules: formValueSelector('marketplaceOfferingCreate')(state, 'schedules'),
});

const enhance = compose(
  connect(mapStateToProps),
  withTranslation,
  withModal(CalendarEventModal),
);

export const OfferingScheduler = enhance(PureOfferingScheduler);
