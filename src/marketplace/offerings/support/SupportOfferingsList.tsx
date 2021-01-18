import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { withTranslation } from '@waldur/i18n';
import { OfferingsListExpandableRow } from '@waldur/marketplace/offerings/expandable/OfferingsListExpandableRow';
import { OfferingsListTablePlaceholder } from '@waldur/marketplace/offerings/OfferingsListTablePlaceholder';
import { Offering } from '@waldur/marketplace/types';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import {
  SUPPORT_OFFERINGS_FILTER_FORM_ID,
  SUPPORT_OFFERING_TABLE_NAME,
} from './constants';

export const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;

  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => <>{row.name}</>,
      orderField: 'name',
    },
    {
      title: translate('Service provider'),
      render: ({ row }) => renderFieldOrDash(row.customer_name),
    },
    {
      title: translate('Category'),
      render: ({ row }) => <>{row.category_title}</>,
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

  return (
    <Table
      {...props}
      placeholderComponent={<OfferingsListTablePlaceholder />}
      columns={columns}
      verboseName={translate('Offerings')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
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
  table: SUPPORT_OFFERING_TABLE_NAME,
  fetchData: createFetcher('marketplace-offerings'),
  mapPropsToFilter,
  exportRow: (row: Offering) => [
    row.name,
    row.customer_name || 'N/A',
    formatDateTime(row.created),
    row.category_title,
    row.state,
  ],
  exportFields: ['Name', 'Service provider', 'Created', 'Category', 'State'],
  queryField: 'name',
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  filter: getFormValues(SUPPORT_OFFERINGS_FILTER_FORM_ID)(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const SupportOfferingsList = enhance(TableComponent);
