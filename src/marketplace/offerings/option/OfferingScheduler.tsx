import { EventInput } from '@fullcalendar/core';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { WrappedFieldArrayProps, formValueSelector } from 'redux-form';

import { CalendarComponent } from '@waldur/booking/components/calendar/CalendarComponent';
import { CalendarSettings } from '@waldur/booking/components/CalendarSettings';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import './OfferingScheduler.scss';

type OfferingSchedulerProps = TranslateProps &
  WrappedFieldArrayProps<any> & {
    setModalProps: (event) => void;
    openModal: (cb) => void;
    schedules: EventInput[];
  };

export const getCalendarState = state => state.bookings;

export const PureOfferingScheduler = (props: OfferingSchedulerProps) => {
  const scheduledEvents = props.fields.getAll();
  const getFieldArrayRemoveIndex = id =>
    scheduledEvents.findIndex(event => event.id === id);

  return (
    <div className="form-group ">
      <Col smOffset={2} sm={8}>
        <Panel>
          <Panel.Heading>
            <h4>{props.translate('Availability')}</h4>
          </Panel.Heading>
          <Panel.Body>
            <CalendarSettings />
          </Panel.Body>
        </Panel>
        <CalendarComponent
          calendarType="create"
          extraEvents={scheduledEvents || []}
          addEventCb={event => props.fields.push(event)}
          timeSlots={slots => slots.map(slot => props.fields.push(slot))}
          removeEventCb={oldID =>
            props.fields.remove(getFieldArrayRemoveIndex(oldID))
          }
        />
      </Col>
    </div>
  );
};
const mapStateToProps = state => ({
  schedules: formValueSelector('marketplaceOfferingCreate')(state, 'schedules'),
});

const enhance = compose(connect(mapStateToProps), withTranslation);

export const OfferingScheduler = enhance(PureOfferingScheduler);
