import type { EventInput } from '@fullcalendar/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { BookingActions } from '@waldur/booking/BookingActions';
import { BookingStateField } from '@waldur/booking/BookingStateField';
import { BOOKING_RESOURCES_TABLE } from '@waldur/booking/constants';
import { formatDateTime, formatShortDateTime } from '@waldur/core/dateUtils';
import { Tooltip } from '@waldur/core/Tooltip';
import { BOOKINGS_FILTER_FORM_ID } from '@waldur/customer/dashboard/contants';
import { withTranslation, translate } from '@waldur/i18n';
import { PublicResourceLink } from '@waldur/marketplace/resources/list/PublicResourceLink';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

interface BookingsList {
  offeringUuid?: string;
  providerUuid?: string;
}

interface DetailedInfo {
  row: {
    uuid: string;
    state: string;
    attributes: {
      schedules: EventInput[];
    };
    project_description: string;
    description: string;
  };
}

const wrapScheduleTitleTooltip = (label, children) =>
  label ? (
    <Tooltip label={label} id="schedule-title-label">
      {children}
    </Tooltip>
  ) : (
    children
  );

const ExpandableRow = ({ row }: DetailedInfo) => (
  <div className="container-fluid">
    <h3 className="m-t-sm">{translate('Schedules')}</h3>
    {row.attributes.schedules.map((schedule, index) => (
      <React.Fragment key={index}>
        {wrapScheduleTitleTooltip(
          schedule.title,
          <>
            {formatShortDateTime(schedule.start)}
            {' - '}
            {formatShortDateTime(schedule.end)}
          </>,
        )}
        {row.attributes.schedules.length > 1 &&
          row.attributes.schedules.length !== index + 1 && <>{'; '}</>}
      </React.Fragment>
    ))}
    <h3 className="m-t-sm">{translate('Project description')}</h3>
    <span>{renderFieldOrDash(row.project_description)}</span>
    <h3 className="m-t-sm">{translate('Booking description')}</h3>
    <span>{renderFieldOrDash(row.description)}</span>
  </div>
);

const TableComponent = (props) => {
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
      title: translate('Project'),
      render: ({ row }) => row.project_name,
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
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('State'),
      render: BookingStateField,
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
      expandableRow={ExpandableRow}
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

export const BookingsList = enhance(TableComponent) as React.ComponentType<
  BookingsList
>;
