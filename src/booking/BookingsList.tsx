import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { BookingActions } from '@waldur/booking/BookingActions';
import { BookingsListExpandableRow } from '@waldur/booking/BookingsListExpandableRow';
import { BookingStateField } from '@waldur/booking/BookingStateField';
import { BookingTimeSlotsField } from '@waldur/booking/BookingTimeSlotsField';
import { BOOKING_RESOURCES_TABLE } from '@waldur/booking/constants';
import { BOOKINGS_FILTER_FORM_ID } from '@waldur/customer/dashboard/contants';
import { translate, withTranslation } from '@waldur/i18n';
import { PublicResourceLink } from '@waldur/marketplace/resources/list/PublicResourceLink';
import { connectTable, createFetcher, Table } from '@waldur/table';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

interface BookingsList {
  offeringUuid?: string;
  providerUuid?: string;
}

const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <PublicResourceLink row={row} customer={props.customer} />
      ),
      orderField: 'name',
    },
    {
      title: translate('Offering'),
      render: ({ row }) => row.offering_name,
    },
    {
      title: translate('Organization'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Created by'),
      render: ({ row }) => row.created_by_full_name,
    },
    {
      title: translate('Approved by'),
      render: ({ row }) => row.approved_by_full_name,
    },
    {
      title: translate('State'),
      render: BookingStateField,
    },
    {
      title: translate('Time slots'),
      render: BookingTimeSlotsField,
      orderField: 'schedules',
    },
  ];

  if (!props.actionsDisabled) {
    columns.push({
      title: translate('Actions'),
      render: ({ row }) => (
        <BookingActions
          row={row}
          offeringUuid={props.offeringUuid}
          providerUuid={props.providerUuid}
        />
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
      expandableRow={BookingsListExpandableRow}
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, string | boolean> = {
    offering_type: 'Marketplace.Booking',
  };
  if (props.offeringUuid) {
    filter.offering_uuid = props.offeringUuid;
  }
  if (props.providerUuid) {
    filter.provider_uuid = props.providerUuid;
  }
  if (props.filter) {
    if (props.filter.state) {
      filter.state = props.filter.state.map((option) => option.value);
    }
  }
  return filter;
};

const TableOptions = {
  table: BOOKING_RESOURCES_TABLE,
  fetchData: createFetcher('booking-resources'),
  mapPropsToFilter,
};

const mapStateToProps = (state) => ({
  customer: getCustomer(state),
  actionsDisabled: !isOwnerOrStaff(state),
  filter: getFormValues(BOOKINGS_FILTER_FORM_ID)(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const BookingsList = enhance(
  TableComponent,
) as React.ComponentType<BookingsList>;
