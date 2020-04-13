import * as classNames from 'classnames';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';

import { BookingsFilter } from '@waldur/booking/BookingsFilter';
import { BookingsList } from '@waldur/booking/BookingsList';
import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { eventRender } from '@waldur/booking/components/utils';
import * as actions from '@waldur/booking/store/actions';
import { eventsMapper } from '@waldur/booking/utils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsType } from '@waldur/marketplace/orders/types';
import { Offering } from '@waldur/marketplace/types';

interface PureOfferingBookingTabProps {
  offeringBookingFetch: ({ offering_uuid }: { offering_uuid: string }) => void;
  offering: Offering;
  bookingOrderItems: OrderItemDetailsType[];
}

export class PureOfferingBookingTab extends React.Component<
  PureOfferingBookingTabProps
> {
  calendarRef = React.createRef();
  state = {
    activeBookingId: null,
  };

  componentDidMount() {
    this.props.offeringBookingFetch({
      offering_uuid: this.props.offering.uuid,
    });
  }

  setActive(item) {
    this.setState({
      activeBookingId: item.uuid,
    });
  }

  getAvailabilityBookingItems() {
    return this.props.offering.attributes.schedules;
  }

  getBookingItems() {
    const { bookingOrderItems, offering } = this.props;
    return bookingOrderItems[offering.uuid];
  }

  isActiveItem(item) {
    return this.state.activeBookingId === item.uuid;
  }

  getCalendarEvents() {
    const items = this.getBookingItems();
    const bookedEvents = items
      .reduce((acc, item) => {
        const { schedules } = item.attributes;
        schedules.forEach(event => {
          event.state = item.state;
          event.className = classNames({
            progress: item.state === 'Creating',
            'event-terminated': item.state === 'Terminated',
            'event-isFocused': item.uuid === this.state.activeBookingId,
          });
          event.color = classNames({
            '#f8ac59': item.state === 'Terminated',
            '#18a689': item.uuid === this.state.activeBookingId,
          });
        });
        acc.push(...schedules);
        return acc;
      }, [])
      .map(cloneDeep);
    const availabilityItems = this.getAvailabilityBookingItems();
    return eventsMapper([...bookedEvents, ...availabilityItems]);
  }

  render() {
    const bookingOrderItems = this.getBookingItems();
    if (!bookingOrderItems) {
      return <LoadingSpinner />;
    }
    if (bookingOrderItems.length === 0) {
      return (
        <div>
          <p>{translate('Currently there are no booking requests.')}</p>
        </div>
      );
    }
    return (
      <Row>
        <Col md={6}>
          <Calendar
            height="auto"
            eventLimit={false}
            events={this.getCalendarEvents()}
            eventRender={info => eventRender({ ...info, withTooltip: true })}
          />
        </Col>
        <Col md={6}>
          <BookingsFilter />
          <BookingsList offeringUuid={this.props.offering.uuid} />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = state => ({ bookingOrderItems: state.bookings });

const mapDispatchToProps = dispatch => ({
  offeringBookingFetch: payload => dispatch(actions.fetchBookingItems(payload)),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const OfferingBookingTab = enhance(PureOfferingBookingTab);
