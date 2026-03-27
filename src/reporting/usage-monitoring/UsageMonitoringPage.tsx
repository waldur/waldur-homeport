import { useMemo } from 'react';
import { FC, useState } from 'react';
import {
  marketplaceStatsResourcesMissingUsageList,
  ResourceMissingUsage,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { UsageMonitoringFilter } from './UsageMonitoringFilter';
import { getCurrentBillingPeriod } from './utils';

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

const columns: Column<ResourceMissingUsage>[] = [
  {
    title: translate('Resource'),
    render: ResourceNameColumn,
  },
  {
    title: translate('Offering'),
    render: OfferingColumn,
  },
  {
    title: translate('Provider'),
    render: ProviderColumn,
  },
  {
    title: translate('Organization'),
    render: CustomerColumn,
  },
  {
    title: translate('Last reported'),
    render: DaysSinceColumn,
  },
  {
    title: translate('State'),
    render: StateColumn,
  },
];

export const UsageMonitoringPage: FC = () => {
  useTitle(translate('Usage monitoring'));
  useReportBreadcrumbs({
    category: 'resources',
    currentReport: 'usage-monitoring',
  });

  const [billingPeriod, setBillingPeriod] = useState(getCurrentBillingPeriod());

  const filter = useMemo(
    () => ({ billing_period: billingPeriod }),
    [billingPeriod],
  );

  const tableProps = useTable({
    table: 'MissingUsageTable',
    fetchData: createFetcher(marketplaceStatsResourcesMissingUsageList),
    filter,
  });

  return (
    <Table<ResourceMissingUsage>
      {...tableProps}
      columns={columns}
      verboseName={translate('resources')}
      title={translate('Usage monitoring')}
      subtitle={translate('Resources with missing usage reports')}
      showPageSizeSelector
      standalone
      hasQuery
      tableActions={
        <UsageMonitoringFilter
          billingPeriod={billingPeriod}
          onBillingPeriodChange={setBillingPeriod}
        />
      }
    />
  );
};
