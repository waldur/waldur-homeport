import { FunctionComponent, useContext } from 'react';
import { Col, FormGroup, Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { WrappedFieldArrayProps } from 'redux-form';

import { CalendarComponent } from '@waldur/booking/components/calendar/CalendarComponent';
import { CalendarSettings } from '@waldur/booking/components/CalendarSettings';
import { getConfig } from '@waldur/booking/store/selectors';
import { BookingProps } from '@waldur/booking/types';
import { deleteCalendarBooking } from '@waldur/booking/utils';
import { FormLayoutContext } from '@waldur/form/context';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import './OfferingScheduler.scss';

import { getSchedules } from '../store/selectors';

type StateProps = ReturnType<typeof mapStateToProps>;

type OfferingSchedulerProps = TranslateProps &
  WrappedFieldArrayProps<BookingProps> &
  StateProps;

const PureOfferingScheduler: FunctionComponent<OfferingSchedulerProps> = (
  props,
) => {
  const { layout } = useContext(FormLayoutContext);

  const col = layout === 'vertical' ? 0 : 8;
  const offset = layout === 'vertical' ? 0 : 2;

  return (
    <FormGroup>
      <Col smOffset={offset} sm={col}>
        <Card>
          <Card.Header>
            <h4>{props.translate('Availability')}</h4>
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

const enhance = compose(connect(mapStateToProps), withTranslation);

export const OfferingScheduler = enhance(PureOfferingScheduler);
