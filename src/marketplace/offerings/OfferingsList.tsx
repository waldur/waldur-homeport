import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { withTranslation } from '@waldur/i18n';
import { TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

import { Offering } from '../types';
import { OfferingActions } from './actions/OfferingActions';
import { OfferingCreateButton } from './actions/OfferingCreateButton';
import { OfferingDetailsLink } from './details/OfferingDetailsLink';
import { OfferingsListTablePlaceholder } from './OfferingsListTablePlaceholder';

export const TableComponent = props => {
  const { translate } = props;

  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => <OfferingDetailsLink offering_uuid={row.uuid}>{row.name}</OfferingDetailsLink>,
      orderField: 'name',
    },
    {
      title: translate('Category'),
      render: ({ row }) => row.category_title,
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
    },
  ];

  if (!props.actionsDisabled) {
    columns.push({
      title: translate('Actions'),
      render: ({ row }) => <OfferingActions row={row}/>,
    });
  }

  return (
    <Table
      {...props}
      placeholderComponent={<OfferingsListTablePlaceholder />}
      columns={columns}
      verboseName={translate('Offerings')}
      actions={props.showOfferingCreateButton && <OfferingCreateButton/>}
      initialSorting={{field: 'created', mode: 'desc'}}
      enableExport={true}
    />
  );
};

const mapPropsToFilter = props => {
  const filter: Record<string, string | boolean> = {
    billable: true,
    shared: true,
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

export const TableOptions = {
  table: TABLE_NAME,
  fetchData: createFetcher('marketplace-offerings'),
  mapPropsToFilter,
  exportRow: (row: Offering) => [
    row.name,
    row.native_name,
    formatDateTime(row.created),
    row.category_title,
    row.state,
  ],
  exportFields: [
    'Name',
    'Native name',
    'Created',
    'Category',
    'State',
  ],
};

const showOfferingCreateButton = createSelector(
  isOwnerOrStaff,
  getCustomer,
  (ownerOrStaff, customer) => customer && customer.is_service_provider && ownerOrStaff,
);

const mapStateToProps = state => ({
  customer: getCustomer(state),
  actionsDisabled: !isOwnerOrStaff(state),
  showOfferingCreateButton: showOfferingCreateButton(state),
  filter: getFormValues('OfferingsFilter')(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const OfferingsList = enhance(TableComponent);
