import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { BookingsListExpandableRow } from '@waldur/booking/BookingsListExpandableRow';
import { BookingStateField } from '@waldur/booking/BookingStateField';
import { BookingTimeSlotsField } from '@waldur/booking/BookingTimeSlotsField';
import {
  BOOKING_RESOURCES_TABLE,
  OFFERING_TYPE_BOOKING,
} from '@waldur/booking/constants';
import { CreatedByField } from '@waldur/booking/CreatedByField';
import { translate, withTranslation } from '@waldur/i18n';
import { PublicResourceLink } from '@waldur/marketplace/resources/list/PublicResourceLink';
import { MarketplaceResourceActions } from '@waldur/marketplace/resources/MarketplaceResourceActions';
import { RootState } from '@waldur/store/reducers';
import { connectTable, createFetcher, Table } from '@waldur/table';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

import { bookingFormSelector } from './store/selectors';

type OwnProps = {
  offeringUuid?: string;
  customerUuid?: string;
};

type StateProps = ReturnType<typeof mapStateToProps>;

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
      render: CreatedByField,
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
        <MarketplaceResourceActions
          resource={row}
          reInitResource={() => props.fetch()}
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

const mapPropsToFilter = (props: StateProps & OwnProps) => {
  const filter: Record<string, any> = {
    offering_type: OFFERING_TYPE_BOOKING,
  };
  if (props.offeringUuid) {
    filter.offering_uuid = props.offeringUuid;
  }
  if (props.customerUuid) {
    filter.connected_customer_uuid = props.customerUuid;
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

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  actionsDisabled: !isOwnerOrStaff(state),
  filter: bookingFormSelector(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const BookingsList = enhance(
  TableComponent,
) as React.ComponentType<OwnProps>;
