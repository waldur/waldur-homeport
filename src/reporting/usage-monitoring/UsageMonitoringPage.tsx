import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  marketplaceStatsResourcesMissingUsageList,
  ResourceMissingUsage,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { ReportingTitle } from '../ReportingTitle';

import { FORM_ID, UsageMonitoringFilter } from './UsageMonitoringFilter';

const ResourceNameColumn = ({ row }: { row: ResourceMissingUsage }) => (
  <Link
    state="marketplace-resource-details"
    params={{ resource_uuid: row.uuid }}
  >
    {row.name}
  </Link>
);

const OfferingColumn = ({ row }: { row: ResourceMissingUsage }) => (
  <span className="text-muted">{row.offering_name}</span>
);

const ProviderColumn = ({ row }: { row: ResourceMissingUsage }) => (
  <span className="text-muted">{row.provider_name}</span>
);

const CustomerColumn = ({ row }: { row: ResourceMissingUsage }) => (
  <Link state="organization.dashboard" params={{ uuid: row.customer_uuid }}>
    {row.customer_name}
  </Link>
);

const DaysSinceColumn = ({ row }: { row: ResourceMissingUsage }) => {
  const days = row.days_since_last_report;

  if (days === null) {
    return translate('Never reported');
  }

  if (days === 0) {
    return translate('Today');
  }

  if (days === 1) {
    return translate('1 day ago');
  }

  return translate('{days} days ago', { days });
};

const STATE_VARIANTS = {
  OK: 'success',
  Updating: 'warning',
};

const StateColumn = ({ row }: { row: ResourceMissingUsage }) => {
  const stateVariant = STATE_VARIANTS[row.state] || 'secondary';

  return (
    <Badge variant={stateVariant} outline>
      {row.state}
    </Badge>
  );
};

const mapStateToFilter = createSelector(
  getFormValues(FORM_ID),
  (filterValues: any) => {
    const filter: any = {};
    if (filterValues?.billing_period) {
      filter.billing_period = filterValues.billing_period.value;
    }
    return filter;
  },
);

export const UsageMonitoringPage: FC = () => {
  const filter = useSelector(mapStateToFilter);

  const tableProps = useTable({
    table: 'MissingUsageTable',
    fetchData: createFetcher(marketplaceStatsResourcesMissingUsageList),
    filter,
  });

  const columns = useMemo<Column<ResourceMissingUsage>[]>(
    () => [
      {
        title: translate('Resource'),
        render: ResourceNameColumn,
        export: 'name',
      },
      {
        title: translate('Offering'),
        render: OfferingColumn,
        export: 'offering_name',
      },
      {
        title: translate('Provider'),
        render: ProviderColumn,
        export: 'provider_name',
      },
      {
        title: translate('Organization'),
        render: CustomerColumn,
        export: 'customer_name',
      },
      {
        title: translate('Last reported'),
        render: DaysSinceColumn,
        export: (row) => {
          const days = row.days_since_last_report;
          if (days === null) return translate('Never reported');
          if (days === 0) return translate('Today');
          if (days === 1) return translate('1 day ago');
          return translate('{days} days ago', { days });
        },
      },
      {
        title: translate('State'),
        render: StateColumn,
        export: 'state',
      },
    ],
    [],
  );

  return (
    <>
      <ReportingTitle reportKey="usage-monitoring" />
      <Table<ResourceMissingUsage>
        {...tableProps}
        columns={columns}
        verboseName={translate('resources')}
        showPageSizeSelector
        hasQuery
        enableExport
        filters={<UsageMonitoringFilter />}
      />
    </>
  );
};
