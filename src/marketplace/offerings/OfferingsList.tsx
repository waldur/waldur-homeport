import * as React from 'react';
import * as ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { withTranslation } from '@waldur/i18n';
import { SUPPORT_OFFERINGS_FILTER_FORM_ID } from '@waldur/marketplace/offerings/customers/constants';
import { OfferingsListExpandableRow } from '@waldur/marketplace/offerings/customers/OfferingsListExpandableRow';
import { PreviewOfferingButton } from '@waldur/marketplace/offerings/PreviewOfferingButton';
import { TABLE_NAME } from '@waldur/marketplace/offerings/store/constants';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

import { Offering } from '../types';

import { OfferingActions } from './actions/OfferingActions';
import { OfferingCreateButton } from './actions/OfferingCreateButton';
import { OfferingDetailsLink } from './details/OfferingDetailsLink';
import { OfferingsListTablePlaceholder } from './OfferingsListTablePlaceholder';

const OfferingNameColumn = ({ isReporting, row }) =>
  !isReporting ? (
    <OfferingDetailsLink offering_uuid={row.uuid}>
      {row.name}
    </OfferingDetailsLink>
  ) : (
    <>{row.name}</>
  );

export const TableComponent = (props) => {
  const { translate, isReporting } = props;

  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <OfferingNameColumn isReporting={isReporting} row={row} />
      ),
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

  if (isReporting) {
    columns.splice(1, 0, {
      title: translate('Service provider'),
      render: ({ row }) => renderFieldOrDash(row.customer_name),
    });
  }

  if (!props.actionsDisabled) {
    columns.push({
      title: translate('Actions'),
      render: ({ row }) => {
        return (
          <ButtonGroup>
            <OfferingActions row={row} />
            <PreviewOfferingButton offering={row} />
          </ButtonGroup>
        );
      },
    });
  }

  return (
    <Table
      {...props}
      placeholderComponent={<OfferingsListTablePlaceholder />}
      columns={columns}
      verboseName={translate('Offerings')}
      actions={props.showOfferingCreateButton && <OfferingCreateButton />}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      expandableRow={OfferingsListExpandableRow}
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, string | boolean> = {
    billable: true,
    shared: true,
  };
  if (props.customer && !props.isReporting) {
    filter.customer_uuid = props.customer.uuid;
  }
  if (props.filter) {
    if (props.filter.state) {
      filter.state = props.filter.state.map((option) => option.value);
    }
    if (props.filter.organization) {
      filter.customer_uuid = props.filter.organization.uuid;
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
    formatDateTime(row.created),
    row.category_title,
    row.state,
  ],
  exportFields: ['Name', 'Created', 'Category', 'State'],
};

const showOfferingCreateButton = createSelector(
  isOwnerOrStaff,
  getCustomer,
  (ownerOrStaff, customer) =>
    customer && customer.is_service_provider && ownerOrStaff,
);

const mapStateToProps = (state, ownProps) => ({
  customer: getCustomer(state),
  actionsDisabled: !isOwnerOrStaff(state) || ownProps.isReporting,
  showOfferingCreateButton:
    showOfferingCreateButton(state) && !ownProps.isReporting,
  filter: getFormValues(
    ownProps.isReporting ? SUPPORT_OFFERINGS_FILTER_FORM_ID : 'OfferingsFilter',
  )(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const OfferingsList = enhance(TableComponent);
