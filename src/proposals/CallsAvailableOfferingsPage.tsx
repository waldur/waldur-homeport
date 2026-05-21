import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { Link } from '@/core/Link';
import { LandingHeroSection } from '@/dashboard/hero/LandingHeroSection';
import { translate } from '@/i18n';
import { OfferingStateCell } from '@/marketplace/offerings/list/OfferingStateCell';
import { getStates } from '@/marketplace/offerings/list/OfferingStateFilter';
import { useFullPage } from '@/navigation/context';
import { AvailableOfferingCard } from '@/proposals/AvailableOfferingCard';
import { createFetcher } from '@/table/api';
import {
  MarketplaceProviderOfferingsFilter,
  MarketplaceProviderOfferingsFilterFormId,
  MarketplaceProviderOfferingsFilterInitialValues,
  selectMarketplaceProviderOfferingsFilter,
} from '@/table/generated/MarketplaceProviderOfferingsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const CallsAvailableOfferingsTable: FunctionComponent = () => {
  const { values } = useFormState();

  const stateFilter = useMemo(
    () => selectMarketplaceProviderOfferingsFilter(values),
    [values],
  );

  const filter = useMemo(
    () => ({
      ...stateFilter,
      accessible_via_calls: true,
    }),
    [stateFilter],
  );

  const tableProps = useTable({
    table: 'PublicAvailableOfferingsList',
    fetchData: createFetcher(marketplacePublicOfferingsList),
    queryField: 'name',
    filter,
  });

  return (
    <Table
      title={translate('Available offerings')}
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          orderField: 'name',
          render: ({ row }) => (
            <Link
              state="public-offering.marketplace-public-offering"
              params={{ uuid: row.uuid }}
              label={row.name}
            />
          ),

          copyField: (row) => row.name,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{renderFieldOrDash(row.description)}</>,
        },
        {
          title: translate('Customer'),
          render: ({ row }) => <>{row.customer_name}</>,
        },
        {
          title: translate('State'),
          render: OfferingStateCell,
          filter: 'state',
          inlineFilter: (row) =>
            getStates().filter((s) => s.value === row.state),
        },
      ]}
      gridItem={({ row }) => <AvailableOfferingCard availableOffering={row} />}
      gridSize={{ lg: 6, xl: 4 }}
      hoverShadow={{ grid: false }}
      verboseName={translate('Available offerings')}
      initialSorting={{ field: 'name', mode: 'desc' }}
      hasQuery={true}
      filters={<MarketplaceProviderOfferingsFilter />}
      formId={MarketplaceProviderOfferingsFilterFormId}
    />
  );
};

export const CallsAvailableOfferingsPage: FunctionComponent = () => {
  useFullPage();

  return (
    <>
      <LandingHeroSection
        header={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        title={translate('Available offerings')}
        context="calls"
      />

      <div className="container-fluid mt-20 mb-10">
        <Form
          id={MarketplaceProviderOfferingsFilterFormId}
          onSubmit={() => {}}
          initialValues={MarketplaceProviderOfferingsFilterInitialValues}
          subscription={{
            values: true,
          }}
        >
          {() => <CallsAvailableOfferingsTable />}
        </Form>
      </div>
    </>
  );
};
