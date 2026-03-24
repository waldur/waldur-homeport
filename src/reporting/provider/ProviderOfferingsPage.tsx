import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  marketplaceProviderOfferingsList,
  marketplaceStatsProviderOfferingsRetrieve,
  ProviderOffering,
  ProviderOfferingStats,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ProviderFilter } from './ProviderFilter';
import { TopOfferingsByResourcesChart } from './TopOfferingsByResourcesChart';
import { TopOfferingsByRevenueChart } from './TopOfferingsByRevenueChart';

interface OfferingStatsData {
  offering_uuid: string;
  offering_name: string;
  resource_count: number;
  order_count: number;
  revenue: number;
  state: string;
}

// Column components for the offerings table
const OfferingNameColumn = ({ row }: { row: ProviderOffering }) => (
  <Link
    state="marketplace-provider-offering-details"
    params={{ offering_uuid: row.uuid }}
    className="text-dark text-hover-primary fw-semibold"
  >
    {row.name}
  </Link>
);

const CategoryColumn = ({ row }: { row: ProviderOffering }) => (
  <span className="text-muted">{row.category_title}</span>
);

const StateColumn = ({ row }: { row: ProviderOffering }) => {
  const variant =
    row.state === 'Active'
      ? 'success'
      : row.state === 'Paused'
        ? 'warning'
        : 'secondary';
  return (
    <Badge variant={variant} outline>
      {row.state}
    </Badge>
  );
};

const ResourcesColumn = ({ row }: { row: ProviderOffering }) => (
  <span className="fw-bold text-primary">{row.resources_count || 0}</span>
);

const TypeColumn = ({ row }: { row: ProviderOffering }) => (
  <span className="text-muted">{row.type}</span>
);

const columns: Column<ProviderOffering>[] = [
  {
    title: translate('Offering'),
    render: OfferingNameColumn,
    orderField: 'name',
  },
  {
    title: translate('Category'),
    render: CategoryColumn,
  },
  {
    title: translate('State'),
    render: StateColumn,
    orderField: 'state',
  },
  {
    title: translate('Resources'),
    render: ResourcesColumn,
  },
  {
    title: translate('Type'),
    render: TypeColumn,
    orderField: 'type',
  },
];

// Offerings table component using useTable
const OfferingsTable: FC<{ customerUuid: string }> = ({ customerUuid }) => {
  const filter = useMemo(
    () => ({
      customer_uuid: customerUuid,
      field: [
        'uuid',
        'name',
        'category_title',
        'state',
        'resources_count',
        'type',
      ],
    }),
    [customerUuid],
  );

  const tableProps = useTable({
    table: 'ProviderOfferingsTable',
    fetchData: createFetcher(marketplaceProviderOfferingsList),
    filter,
  });

  return (
    <Table<ProviderOffering>
      {...tableProps}
      columns={columns}
      verboseName={translate('offerings')}
      title={translate('All offerings')}
      showPageSizeSelector
    />
  );
};

// Summary cards and charts component
const ProviderOfferingsSummary: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-offerings-stats', providerUuid],
    queryFn: async () => {
      const response = await marketplaceStatsProviderOfferingsRetrieve({
        query: { provider_uuid: providerUuid },
      });
      return response.data as ProviderOfferingStats;
    },
    enabled: !!providerUuid,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;
  if (!data) return null;

  const offerings = (data.offerings as unknown as OfferingStatsData[]) || [];
  const totalResources = offerings.reduce(
    (sum, o) => sum + o.resource_count,
    0,
  );
  const totalRevenue = offerings.reduce((sum, o) => sum + (o.revenue || 0), 0);
  const activeOfferings = offerings.filter((o) => o.state === 'Active').length;

  return (
    <>
      <Row className="g-4 mb-6">
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-primary">
                {offerings.length}
              </div>
              <div className="text-muted fs-7">
                {translate('Total offerings')}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-success">{activeOfferings}</div>
              <div className="text-muted fs-7">
                {translate('Active offerings')}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-info">{totalResources}</div>
              <div className="text-muted fs-7">
                {translate('Total resources')}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="card-flush h-100">
            <Card.Body className="py-5">
              <div className="fs-2 fw-bold text-warning">
                {defaultCurrency(totalRevenue)}
              </div>
              <div className="text-muted fs-7">
                {translate('Total revenue')}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-6">
        <Col xs={12} lg={6}>
          <TopOfferingsByResourcesChart offerings={offerings} />
        </Col>
        <Col xs={12} lg={6}>
          <TopOfferingsByRevenueChart offerings={offerings} />
        </Col>
      </Row>
    </>
  );
};

export const ProviderOfferingsPage: FC = () => {
  useTitle(translate('Provider offerings'));
  useReportBreadcrumbs({ category: 'provider', currentReport: 'offerings' });

  const formValues = useSelector(getFormValues('ProviderReportingFilter')) as {
    provider?: { uuid: string; customer_uuid: string };
  };
  const providerUuid = formValues?.provider?.uuid;
  const customerUuid = formValues?.provider?.customer_uuid;

  return (
    <div className="container-fluid py-6">
      <div className="d-flex flex-wrap gap-6 mb-6">
        <FormGroup
          label={translate('Provider')}
          className="flex-grow-1 mw-300px"
        >
          <ProviderFilter />
        </FormGroup>
      </div>

      {providerUuid && customerUuid ? (
        <>
          <ProviderOfferingsSummary providerUuid={providerUuid} />
          <OfferingsTable customerUuid={customerUuid} />
        </>
      ) : (
        <NoResult
          title={translate('Select a provider')}
          message={translate(
            'Choose a provider from the dropdown above to view offering statistics.',
          )}
          callback={() => {}}
        />
      )}
    </div>
  );
};
