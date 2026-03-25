import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  marketplaceResourcesList,
  marketplaceStatsProviderResourcesRetrieve,
  ProviderResourceStats,
  Resource,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ProviderFilter } from './ProviderFilter';
import { ResourceCreationTrendChart } from './ResourceCreationTrendChart';
import { ResourcesByStateChart } from './ResourcesByStateChart';

interface MonthlyData {
  month: string;
  count: number;
}

// Resource name column with link
const ResourceNameColumn = ({ row }: { row: Resource }) => (
  <Link
    state="marketplace-public-resource-details"
    params={{ resource_uuid: row.uuid }}
    className="text-dark text-hover-primary fw-semibold"
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
      return response.data as ProviderResourceStats;
    },
    enabled: !!providerUuid,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data) return null;

  const okCount = (data.by_state as any)?.OK || 0;
  const erredCount = (data.by_state as any)?.Erred || 0;

  return (
    <>
      <Row className="g-4 mb-6">
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-primary">{data.total}</div>
              <div className="text-muted fs-7">
                {translate('Total active resources')}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-success">{okCount}</div>
              <div className="text-muted fs-7">{translate('Healthy (OK)')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-danger">{erredCount}</div>
              <div className="text-muted fs-7">{translate('Erred')}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-6">
        <Col xs={12} lg={6}>
          <ResourcesByStateChart
            byState={(data.by_state as Record<string, number>) || {}}
          />
        </Col>
        <Col xs={12} lg={6}>
          <ResourceCreationTrendChart
            monthly={(data.monthly as unknown as MonthlyData[]) || []}
          />
        </Col>
      </Row>
    </>
  );
};

export const ProviderResourcesPage: FC = () => {
  useTitle(translate('Provider resources'));
  useReportBreadcrumbs({ category: 'provider', currentReport: 'resources' });

  const formValues = useSelector(getFormValues('ProviderReportingFilter')) as {
    provider?: { uuid: string };
  };
  const providerUuid = formValues?.provider?.uuid;

  return (
    <>
      <div className="d-flex flex-wrap gap-6 mb-6">
        <FormGroup
          label={translate('Provider')}
          className="flex-grow-1 mw-300px"
        >
          <ProviderFilter />
        </FormGroup>
      </div>

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
};
