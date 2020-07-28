import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { WrappedFieldArrayProps, formValueSelector } from 'redux-form';

import { CalendarComponent } from '@waldur/booking/components/calendar/CalendarComponent';
import { CalendarSettings } from '@waldur/booking/components/CalendarSettings';
import { BookingProps, State, ConfigProps } from '@waldur/booking/types';
import { deleteCalendarBooking } from '@waldur/booking/utils';
import { withTranslation, TranslateProps } from '@waldur/i18n';

import './OfferingScheduler.scss';

type OfferingSchedulerProps = TranslateProps &
  WrappedFieldArrayProps<any> & {
    setModalProps: (event) => void;
    openModal: (cb) => void;
    schedules: BookingProps[];
    config: ConfigProps;
  };

export const PureOfferingScheduler = (props: OfferingSchedulerProps) => (
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
        events={props.fields.getAll() || []}
        addEventCb={props.fields.push}
        removeEventCb={(id) => deleteCalendarBooking(props.fields, { id })}
        options={props.config}
      />
    </Col>
  </div>
);

const mapStateToProps = (state) => ({
  schedules: formValueSelector('marketplaceOfferingCreate')(state, 'schedules'),
  config: state.bookings.config as State,
});

const enhance = compose(connect(mapStateToProps), withTranslation);

export const OfferingScheduler = enhance(PureOfferingScheduler);
