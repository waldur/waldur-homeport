import { EventInput } from '@fullcalendar/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { BookingActions } from '@waldur/booking/BookingActions';
import { bookingDataTemplate } from '@waldur/booking/components/utils';
import { TABLE_NAME } from '@waldur/booking/constants';
import { formatDateTime, formatShortDateTime } from '@waldur/core/dateUtils';
import { withTranslation, translate } from '@waldur/i18n';
import { OrderItemDetailsLink } from '@waldur/marketplace/orders/item/details/OrderItemDetailsLink';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

interface BookingsList {
  offeringUuid: string;
}

interface DetailedInfo {
  row: {
    uuid: string;
    state: string;
    attributes: {
      schedules: EventInput[];
    };
  };
}

const ExpandableRow = ({ row }: DetailedInfo) => (
  <div className="container-fluid">
    <h3>{translate('Schedules')}:</h3>
    {row.attributes.schedules.map(({ end, start, title, allDay }, index) => (
      <div className="form-horizontal" key={index}>
        {bookingDataTemplate({
          Title: title,
          'All day': allDay ? 'Yes' : 'No',
          End: formatShortDateTime(end),
          Start: formatShortDateTime(start),
          State:
            row.state === 'Creating'
              ? 'Waiting for confirmation...'
              : row.state,
        })}
        {row.attributes.schedules.length > 1 &&
          row.attributes.schedules.length !== index + 1 && <hr />}
      </div>
    ))}
  </div>
);

const TableComponent = props => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <OrderItemDetailsLink
          order_item_uuid={row.uuid}
          project_uuid={row.project_uuid}
        >
          {row.attributes.name || row.offering_name}
        </OrderItemDetailsLink>
      ),
      orderField: 'name',
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('State'),
      render: ResourceStateField,
    },
  ];

  if (!props.actionsDisabled) {
    columns.push({
      title: translate('Actions'),
      render: ({ row }) => (
        <BookingActions row={row} refresh={() => props.fetch()} />
      ),
    });
  }
  return (
    <Table
      {...props}
      columns={columns}
      showPageSizeSelector={true}
      verboseName={translate('Bookings')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      expandableRow={ExpandableRow}
    />
  );
};

const mapPropsToFilter = props => {
  const filter: Record<string, string | boolean> = {
    offering_uuid: props.offeringUuid,
  };
  if (props.customer) {
    filter.customer_uuid = props.customer.uuid;
  }
  if (props.filter) {
    if (props.filter.state) {
      filter.state = props.filter.state.map(option => option.value);
    }
  }
  return filter;
};

const TableOptions = {
  table: TABLE_NAME,
  fetchData: createFetcher('booking-resources'),
  mapPropsToFilter,
};

const mapStateToProps = state => ({
  customer: getCustomer(state),
  actionsDisabled: !isOwnerOrStaff(state),
  filter: getFormValues('BookingsFilter')(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const BookingsList = enhance(TableComponent) as React.ComponentType<
  BookingsList
>;
