import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { WrappedFieldArrayProps } from 'redux-form';

import { CalendarComponent } from '@waldur/booking/components/calendar/CalendarComponent';
import { CalendarSettings } from '@waldur/booking/components/CalendarSettings';
import { getConfig } from '@waldur/booking/store/selectors';
import { BookingProps } from '@waldur/booking/types';
import { deleteCalendarBooking } from '@waldur/booking/utils';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import './OfferingScheduler.scss';

import { getSchedules } from '../store/selectors';

type StateProps = ReturnType<typeof mapStateToProps>;

type OfferingSchedulerProps = WrappedFieldArrayProps<BookingProps> & StateProps;

const PureOfferingScheduler: FunctionComponent<OfferingSchedulerProps> = (
  props,
) => {
  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title>
            <h3>{translate('Availability')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <CalendarSettings />
        </Card.Body>
      </Card>

      <CalendarComponent
        calendarType="create"
        events={props.fields.getAll() || []}
        addEventCb={props.fields.push}
        removeEventCb={(id) => deleteCalendarBooking(props.fields, { id })}
        options={props.config}
      />
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  schedules: getSchedules(state),
  config: getConfig(state),
});

const enhance = connect(mapStateToProps);

export const OfferingScheduler = enhance(
  PureOfferingScheduler,
) as React.ComponentType<any>;
