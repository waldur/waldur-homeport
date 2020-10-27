import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { fetchOfferingCustomers } from '@waldur/marketplace/offerings/customers/api';
import { CUSTOMERS_LIST_TABLE_ID } from '@waldur/marketplace/offerings/customers/constants';
import { Table, connectTable } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';

export const TableComponent = (props) => {
  const { filterColumns } = props;
  const columns = filterColumns([
    {
      title: translate('Organization'),
      render: ({ row }) => <span>{row.name}</span>,
    },
    {
      title: translate('Abbreviation'),
      render: ({ row }) => <span>{renderFieldOrDash(row.abbreviation)}</span>,
    },
  ]);

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Organizations')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
    />
  );
};

const mapPropsToFilter = ({ customerListFilter, offeringUuid }) => ({
  accounting_is_running: customerListFilter?.accounting_is_running
    ? customerListFilter.accounting_is_running.value
    : undefined,
  offering_uuid: offeringUuid,
});

const TableOptions = {
  table: CUSTOMERS_LIST_TABLE_ID,
  fetchData: fetchOfferingCustomers,
  queryField: 'query',
  mapPropsToFilter: (props) => mapPropsToFilter(props),
  mapPropsToTableId: (props) => [props.offeringUuid],
};

const mapStateToProps = (state, ownProps) => ({
  customerListFilter: getFormValues(ownProps.uniqueFormId)(state),
});

const enhance = compose<any>(
  connect(mapStateToProps),
  connectTable(TableOptions),
);

export const CustomersList = enhance(TableComponent);
