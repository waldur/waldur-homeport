import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  marketplaceProviderOfferingsList,
  marketplaceStatsProviderOfferingsRetrieve,
  ProviderOffering,
  ProviderOfferingStats,
} from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SummaryWidget } from '@waldur/core/SummaryWidget';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { OfferingStateField } from '@waldur/marketplace/offerings/OfferingStateField';
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

const ResourcesColumn = ({ row }: { row: ProviderOffering }) => (
  <span className="fw-bold">{row.resources_count || 0}</span>
);

const TypeColumn = ({ row }: { row: ProviderOffering }) => (
  <span className="text-muted">{getLabel(row.type)}</span>
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
    render: ({ row }) => <OfferingStateField offering={row} />,
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
      <SummaryWidget
        stats={[
          { label: translate('Total offerings'), value: offerings.length },
          { label: translate('Active offerings'), value: activeOfferings },
          { label: translate('Total resources'), value: totalResources },
          {
            label: translate('Total revenue'),
            value: defaultCurrency(totalRevenue),
          },
        ]}
      />

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
    <>
      <div className="table-standalone-header d-flex justify-content-between gap-4 mb-6">
        <h1 className="mb-0 fs-1x">{translate('Provider offerings')}</h1>
        <div className="d-none d-sm-flex gap-4">
          <div className="d-flex align-items-center gap-4">
            <label className="text-muted fs-7 fw-semibold whitespace-nowrap">
              {translate('Provider')}:
            </label>
            <div style={{ minWidth: 200 }}>
              <ProviderFilter />
            </div>
          </div>
        </div>
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
          noAction
        />
      )}
    </>
  );
};
