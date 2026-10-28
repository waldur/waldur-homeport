import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceResourcesList,
  marketplaceStatsProviderResourcesRetrieve,
  Resource,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { NoResult } from '@/navigation/header/search/NoResult';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { ReportingTitle } from '../ReportingTitle';

import { ProviderSelector } from './ProviderSelector';
import { ResourceCreationTrendChart } from './ResourceCreationTrendChart';
import { ResourcesByStateChart } from './ResourcesByStateChart';

// Resource name column with link
const ResourceNameColumn = ({ row }: { row: Resource }) => (
  <Link
    state="marketplace-resource-details"
    params={{ resource_uuid: row.uuid }}
  >
    {row.name || row.offering_name}
  </Link>
);

// Table columns for provider resources
const resourceColumns: Column<Resource>[] = [
  {
    title: translate('Name'),
    render: ResourceNameColumn,
    orderField: 'name',
  },
  {
    title: translate('Offering'),
    render: ({ row }) => <span>{row.offering_name}</span>,
  },
  {
    title: translate('Customer'),
    render: ({ row }) => <span>{row.customer_name}</span>,
  },
  {
    title: translate('Project'),
    render: ({ row }) => <span>{row.project_name}</span>,
  },
  {
    title: translate('State'),
    render: ({ row }) => (
      <ResourceStateField resource={row} shape="pill" tone="outline" />
    ),
    orderField: 'state',
  },
  {
    title: translate('Created'),
    render: ({ row }) => <span>{formatDateTime(row.created)}</span>,
    orderField: 'created',
  },
];

// Resources table component using useTable
const ProviderResourcesTable: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const filter = useMemo(
    () => ({
      provider_uuid: providerUuid,
      field: [
        'uuid',
        'name',
        'offering_name',
        'customer_name',
        'project_name',
        'state',
        'created',
        'backend_metadata',
      ],
    }),
    [providerUuid],
  );

  const tableProps = useTable({
    table: 'ProviderResourcesTable',
    fetchData: createFetcher(marketplaceResourcesList),
    filter,
  });

  return (
    <Table<Resource>
      {...tableProps}
      columns={resourceColumns}
      verboseName={translate('resources')}
      title={translate('All resources')}
      showPageSizeSelector
      initialSorting={{ field: 'created', mode: 'desc' }}
    />
  );
};

const ProviderResourcesContent: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-resources', providerUuid],
    queryFn: async () => {
      const response = await marketplaceStatsProviderResourcesRetrieve({
        query: { provider_uuid: providerUuid },
      });
      return response.data;
    },
    enabled: !!providerUuid,
  });

  const stats = useMemo(
    () =>
      data
        ? [
            {
              label: translate('Total active resources'),
              value: data.total,
            },
            {
              label: translate('Healthy (OK)'),
              value: data.by_state?.OK || 0,
            },
            {
              label: translate('Erred'),
              value: data.by_state?.Erred || 0,
            },
          ]
        : [],
    [data],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data) return null;

  return (
    <>
      <SummaryWidget stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
        <div>
          <ResourcesByStateChart
            byState={(data.by_state as Record<string, number>) || {}}
          />
        </div>
        <div>
          <ResourceCreationTrendChart monthly={data.monthly || []} />
        </div>
      </div>
    </>
  );
};

export const ProviderResourcesPage: FC = () => {
  return (
    <Form onSubmit={() => {}} subscription={{ values: true }}>
      {({ values }) => {
        const providerUuid = values?.provider?.uuid;
        return (
          <>
            <ReportingTitle reportKey="provider-resources">
              <div className="flex items-center gap-3">
                <label className="text-quaternary text-xs whitespace-nowrap">
                  {translate('Provider')}:
                </label>
                <div style={{ minWidth: 200 }}>
                  <ProviderSelector />
                </div>
              </div>
            </ReportingTitle>

            {providerUuid ? (
              <>
                <ProviderResourcesContent providerUuid={providerUuid} />
                <ProviderResourcesTable providerUuid={providerUuid} />
              </>
            ) : (
              <NoResult
                title={translate('Select a provider')}
                message={translate(
                  'Choose a provider from the dropdown above to view resource statistics.',
                )}
                noAction
              />
            )}
          </>
        );
      }}
    </Form>
  );
};
