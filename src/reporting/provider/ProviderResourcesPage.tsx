import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
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

import { ProviderFilter } from './ProviderFilter';
import { ResourceCreationTrendChart } from './ResourceCreationTrendChart';
import { ResourcesByStateChart } from './ResourcesByStateChart';

// Resource name column with link
const ResourceNameColumn = ({ row }: { row: Resource }) => (
  <Link
    state="marketplace-public-resource-details"
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
    render: ({ row }) => <ResourceStateField resource={row} pill outline />,
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

      <Row className="g-4 mb-6">
        <Col xs={12} lg={6}>
          <ResourcesByStateChart
            byState={(data.by_state as Record<string, number>) || {}}
          />
        </Col>
        <Col xs={12} lg={6}>
          <ResourceCreationTrendChart monthly={data.monthly || []} />
        </Col>
      </Row>
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
              <div className="d-flex align-items-center gap-4">
                <label className="text-muted fs-7 fw-semibold whitespace-nowrap">
                  {translate('Provider')}:
                </label>
                <div style={{ minWidth: 200 }}>
                  <ProviderFilter />
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
