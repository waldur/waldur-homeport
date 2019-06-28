import * as classNames from 'classnames';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { eventsMapper } from '@waldur/booking/utils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import * as actions from '@waldur/marketplace/offerings/store/actions';
import { OrderItemDetailsLink } from '@waldur/marketplace/orders/item/details/OrderItemDetailsLink';
import { OrderItemDetailsType } from '@waldur/marketplace/orders/types';
import { Offering } from '@waldur/marketplace/types';

interface PureOfferingBookingTabProps {
  offeringBookingFetch: ({offering_uuid}: {offering_uuid: string}) => void;
  offering: Offering;
  bookingOrderItems: OrderItemDetailsType[];
}

export class PureOfferingBookingTab extends React.Component<PureOfferingBookingTabProps> {

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
    const bookedEvents = items.reduce((acc, item) => {
      const { schedules } = item.attributes;
      schedules.forEach(event => {
        if (this.isActiveItem(item)) {
          event.color = 'green';
        } else {
          event.color = null;
        }
      });
      acc.push(...schedules);
      return acc;
    }, []).map(cloneDeep);
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
        <Col sm={6}>
          <Calendar events={this.getCalendarEvents()}
          />
        </Col>
        <Col sm={6}>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>
                  {translate('Project')}
                </th>
                <th>
                  {translate('Name')}
                </th>
                <th>
                  {translate('Status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {bookingOrderItems.map(booking => (
                <tr onClick={() => this.setActive(booking)}
                    className={classNames('cursor-pointer', {active: this.isActiveItem(booking)})}
                    key={booking.uuid}>
                  <td>
                    {booking.project_name}
                  </td>
                  <td>
                  <OrderItemDetailsLink
                    order_item_uuid={booking.uuid}
                    project_uuid={booking.project_uuid}>
                      {booking.attributes.name || booking.offering_name}
                  </OrderItemDetailsLink>
                  </td>
                  <td>
                    {booking.state}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = state => ({
  bookingOrderItems: state.marketplace.offering.bookings,
});

const mapDispatchToProps = dispatch => ({
  offeringBookingFetch: payload => dispatch(actions.offeringBookingFetch(payload)),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const OfferingBookingTab = enhance(PureOfferingBookingTab);
