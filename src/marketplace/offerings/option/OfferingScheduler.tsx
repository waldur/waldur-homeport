import { FunctionComponent, useContext } from 'react';
import { Col, FormGroup, Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { WrappedFieldArrayProps } from 'redux-form';

import { CalendarComponent } from '@waldur/booking/components/calendar/CalendarComponent';
import { CalendarSettings } from '@waldur/booking/components/CalendarSettings';
import { getConfig } from '@waldur/booking/store/selectors';
import { BookingProps } from '@waldur/booking/types';
import { deleteCalendarBooking } from '@waldur/booking/utils';
import { FormLayoutContext } from '@waldur/form/context';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import './OfferingScheduler.scss';

import { getSchedules } from '../store/selectors';

type StateProps = ReturnType<typeof mapStateToProps>;

type OfferingSchedulerProps = WrappedFieldArrayProps<BookingProps> & StateProps;

const PureOfferingScheduler: FunctionComponent<OfferingSchedulerProps> = (
  props,
) => {
  const { layout } = useContext(FormLayoutContext);

  const col = layout === 'vertical' ? 0 : 8;
  const offset = layout === 'vertical' ? 0 : 2;

  return (
    <FormGroup>
      <Col sm={{ span: col, offset: offset }}>
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
      </Col>
    </FormGroup>
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
