import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDate } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { defaultCurrency } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';
import { parseCounters } from '@waldur/quotas/QuotaUtilsService';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { TableRequest, Fetcher } from '@waldur/table-react/types';
import { renderFieldOrDash } from '@waldur/table-react/utils';

const OrganizationLink = ({ row }) => (
  <Link
    state="organization.dashboard"
    params={{ uuid: row.uuid }}
    label={row.name}
  />
);

const AbbreviationField = ({ row }) => <span>{renderFieldOrDash(row.abbreviation)}</span>;

const CreatedDateField = ({ row }) => <span>{renderFieldOrDash(formatDate(row.created))}</span>;

const AccountingStartDateField = ({ row }) => <span>{renderFieldOrDash(formatDate(row.accounting_start_date))}</span>;

const VmCountField = ({ row }) => <span>{renderFieldOrDash(row.vm_count)}</span>;

const StorageCountField = ({ row }) => <span>{renderFieldOrDash(row.storage_count)}</span>;

const AppCountField = ({ row }) => <span>{renderFieldOrDash(row.app_count)}</span>;

const PrivateCloudCountField = ({ row }) => <span>{renderFieldOrDash(row.private_cloud_count)}</span>;

const AllocationCountField = ({ row }) => <span>{renderFieldOrDash(row.allocation_count)}</span>;

const ExpertCountField = ({ row }) => <span>{renderFieldOrDash(row.expert_count)}</span>;

const OfferingCountField = ({ row }) => <span>{renderFieldOrDash(row.offering_count)}</span>;

const CurrentCostField = ({ row }) =>
  <span>{renderFieldOrDash(defaultCurrency(row.billing_price_estimate && row.billing_price_estimate.current || 0))}</span>;

const EstimatedCostField = ({ row }) =>
  <span>{renderFieldOrDash(defaultCurrency(row.billing_price_estimate && row.billing_price_estimate.total || 0))}</span>;

export const TableComponent = props => {
  const { translate, filterColumns, customerListFilter } = props;
  const accountingPeriodIsCurrent = customerListFilter.accounting_period.value.current;
  const columns = filterColumns([
    {
      title: translate('Organization'),
      render: OrganizationLink,
    },
    {
      title: translate('Abbreviation'),
      render: AbbreviationField,
    },
    {
      title: translate('Created'),
      render: CreatedDateField,
    },
    {
      title: translate('Start day of accounting'),
      render: AccountingStartDateField,
    },
    {
      title: translate('VMs'),
      render: VmCountField,
    },
    {
      title: translate('Storage'),
      render: StorageCountField,
    },
    {
      title: translate('Apps'),
      render: AppCountField,
      feature: 'resource.applications',
    },
    {
      title: translate('Private clouds'),
      render: PrivateCloudCountField,
    },
    {
      title: translate('Allocations'),
      render: AllocationCountField,
      feature: 'slurm',
    },
    {
      title: translate('Experts'),
      render: ExpertCountField,
      feature: 'experts',
    },
    {
      title: translate('Requests'),
      render: OfferingCountField,
      feature: 'offering',
    },
    {
      title: translate('Current cost'),
      render: CurrentCostField,
      visible: accountingPeriodIsCurrent,
    },
    {
      title: translate('Estimated cost'),
      render: EstimatedCostField,
      visible: accountingPeriodIsCurrent,
    },
    {
      title: translate('Cost'),
      render: EstimatedCostField,
      visible: !accountingPeriodIsCurrent,
    },
  ]);

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Customers List')}
      hasQuery={true}
      showPageSizeSelector={true}
    />
  );
};

const createCustomFetcher = (endpoint: string): Fetcher => {
  return (request: TableRequest) => {
    const fetcher = createFetcher(endpoint);
    return fetcher(request).then(data => {
      return {
        ...data,
        rows: data.rows.map(row => ({...row, ...parseCounters(row)})),
      };
    });
  };
};

const TableOptions = {
  table: 'customerList',
  fetchData: createCustomFetcher('customers'),
  mapPropsToFilter: props => formatFilter(props.customerListFilter),
};

const formatFilter = filter => {
  if (filter) {
    if (filter.accounting_period) {
      return {
        accounting_is_running: filter.accounting_is_running,
        ...filter.accounting_period.value,
      };
    }
    return filter;
  }
};

const mapStateToProps = state => ({
  customerListFilter: getFormValues('customerListFilter')(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const CustomerList = enhance(TableComponent);

export default connectAngularComponent(CustomerList);
