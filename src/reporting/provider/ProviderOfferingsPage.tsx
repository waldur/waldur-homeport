import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsList,
  marketplaceStatsProviderOfferingsRetrieve,
  ProviderOffering,
} from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';
import { getLabel } from '@/marketplace/common/registry';
import { OfferingStateField } from '@/marketplace/offerings/OfferingStateField';
import { NoResult } from '@/navigation/header/search/NoResult';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { ReportingTitle } from '../ReportingTitle';

import { ProviderSelector } from './ProviderSelector';
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
      return response.data;
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
  return (
    <Form onSubmit={() => {}} subscription={{ values: true }}>
      {({ values }) => {
        const providerUuid = values?.provider?.uuid;
        const customerUuid = values?.provider?.customer_uuid;
        return (
          <>
            <ReportingTitle reportKey="provider-offerings">
              <div className="d-flex align-items-center gap-4">
                <label className="text-muted fs-7 fw-semibold whitespace-nowrap">
                  {translate('Provider')}:
                </label>
                <div style={{ minWidth: 200 }}>
                  <ProviderSelector />
                </div>
              </div>
            </ReportingTitle>

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
      }}
    </Form>
  );
};
