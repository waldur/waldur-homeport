import { EventInput } from '@fullcalendar/core';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { WrappedFieldArrayProps, formValueSelector } from 'redux-form';

import { EditableCalendar } from '@waldur/booking/components/calendar/EditableCalendar';
import { CalendarEventModal } from '@waldur/booking/components/modal/CalendarEventModal';
import { withTranslation, TranslateProps } from '@waldur/i18n';
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

export const PureOfferingScheduler = (props: OfferingSchedulerProps) => (
  <div className="form-group OfferingScheduler">
    <Col smOffset={2} sm={8}>
      <Panel>
        <Panel.Heading>
          <h4>{props.translate('Availability')}</h4>
        </Panel.Heading>
        <Panel.Body>
          <EditableCalendar
            events={props.schedules}
            onSelectDate={event => {
              const field = createBooking(event);
              props.fields.push(field);
            }}
            onSelectEvent={prevEvent => {
              props.setModalProps({ event: prevEvent.event });
              props.openModal(event => {
                removeEventFromFields(props.fields, prevEvent.event);
                const field = createBooking(event);
                props.fields.push(field);
              });
            }}
            eventResize={slot => {
              removeEventFromFields(props.fields, slot.prevEvent);
              const field = createBooking(slot.event);
              props.fields.push(field);
            }}
            eventDrop={slot => {
              removeEventFromFields(props.fields, slot.oldEvent);
              const field = createBooking(slot.event);
              props.fields.push(field);
            }}/>
        </Panel.Body>
      </Panel>
    </Col>
  </div>
);

const createBooking = (slot: EventInput) => ({
  ...slot,
  type: 'availability',
});

const removeEventFromFields = (fields, event) => {
  fields.getAll().forEach((field, index) => {
    if (field.id === event.id) {
      fields.remove(index);
    }
  });
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
