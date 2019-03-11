import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDate } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { defaultCurrency, ENV } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
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

const CurrentCostField = ({ row }) => {
  const estimate = row.billing_price_estimate;
  if (!estimate) {
    return defaultCurrency(0);
  }
  // VAT is not included only when accounting mode is activated
  if (ENV.accountingMode === 'accounting') {
    return defaultCurrency(estimate.current);
  } else {
    return defaultCurrency(parseFloat(estimate.current) + parseFloat(estimate.tax_current));
  }
};

const EstimatedCostField = ({ row }) => {
  const estimate = row.billing_price_estimate;
  if (!estimate) {
    return defaultCurrency(0);
  }
  // VAT is not included only when accounting mode is activated
  if (ENV.accountingMode === 'accounting') {
    return defaultCurrency(estimate.total);
  } else {
    return defaultCurrency(parseFloat(estimate.total) + parseFloat(estimate.tax));
  }
};

export const TableComponent = props => {
  const { translate, filterColumns, customerListFilter } = props;
  const accountingPeriodIsCurrent = customerListFilter.accounting_period.value.current;
  const columns = filterColumns([
    {
      title: translate('Organization'),
      render: OrganizationLink,
      orderField: 'name',
    },
    {
      title: translate('Abbreviation'),
      render: AbbreviationField,
      orderField: 'abbreviation',
    },
    {
      title: translate('Created'),
      render: CreatedDateField,
      orderField: 'created',
    },
    {
      title: translate('Start day of accounting'),
      render: AccountingStartDateField,
      orderField: 'accounting_start_date',
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
      title: renderTitleWithPriceTooltip(translate('Current cost')),
      render: CurrentCostField,
      visible: accountingPeriodIsCurrent,
      orderField: 'current_cost',
    },
    {
      title: renderTitleWithPriceTooltip(translate('Estimated cost')),
      render: EstimatedCostField,
      visible: accountingPeriodIsCurrent,
      orderField: 'estimated_cost',
    },
    {
      title: renderTitleWithPriceTooltip(translate('Cost')),
      render: CurrentCostField,
      visible: !accountingPeriodIsCurrent,
      orderField: 'current_cost',
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

const renderTitleWithPriceTooltip = title =>
  <><PriceTooltip/>{' '}{title}</>;

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
  queryField: 'query',
  mapPropsToFilter: props => formatFilter(props.customerListFilter),
  exportRow: row => [
    row.name,
    row.abbreviation,
    formatDate(row.created),
    formatDate(row.accounting_start_date),
    row.vm_count,
    row.storage_count,
    row.private_cloud_count,
    row.billing_price_estimate && row.billing_price_estimate.total || 0,
  ],
  exportFields: [
    'Organization',
    'Abbreviation',
    'Created',
    'Start day of accounting',
    'VMs',
    'Storage',
    'Private clouds',
    'Total cost',
  ],
};

const formatFilter = filter => {
  if (filter) {
    if (filter.accounting_period) {
      return {
        accounting_is_running: filter.accounting_is_running,
        year: filter.accounting_period.value.year,
        month: filter.accounting_period.value.month,
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
