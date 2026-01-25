import { FC, useMemo } from 'react';
import { marketplaceStatsResourcesMissingUsageList } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ResourceMissingUsage } from './types';

const ResourceNameColumn = ({ row }: { row: ResourceMissingUsage }) => (
  <Link
    state="marketplace-resource-details"
    params={{ resource_uuid: row.uuid }}
    className="text-dark text-hover-primary fw-semibold"
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
  <Link
    state="organization.dashboard"
    params={{ uuid: row.customer_uuid }}
    className="text-dark text-hover-primary"
  >
    {row.customer_name}
  </Link>
);

const getDaysSeverity = (
  days: number | null,
): 'success' | 'warning' | 'danger' => {
  if (days === null) return 'danger';
  if (days <= 7) return 'success';
  if (days <= 30) return 'warning';
  return 'danger';
};

const DaysSinceColumn = ({ row }: { row: ResourceMissingUsage }) => {
  const days = row.days_since_last_report;
  const severity = getDaysSeverity(days);

  if (days === null) {
    return (
      <Badge variant="danger" outline>
        {translate('Never reported')}
      </Badge>
    );
  }

  return (
    <Badge variant={severity} outline>
      {days === 0
        ? translate('Today')
        : days === 1
          ? translate('1 day ago')
          : translate('{days} days ago', { days })}
    </Badge>
  );
};

const StateColumn = ({ row }: { row: ResourceMissingUsage }) => {
  const stateVariant =
    row.state === 'OK'
      ? 'success'
      : row.state === 'Updating'
        ? 'warning'
        : 'secondary';

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

interface MissingUsageTableProps {
  billingPeriod: string;
}

export const MissingUsageTable: FC<MissingUsageTableProps> = ({
  billingPeriod,
}) => {
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
      title={translate('Resources with missing usage reports')}
      showPageSizeSelector
    />
  );
};
