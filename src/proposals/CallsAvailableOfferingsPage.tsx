import classNames from 'classnames';
import { FunctionComponent, useMemo } from 'react';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { Link } from '@/core/Link';
import { LandingHeroSection } from '@/dashboard/hero/LandingHeroSection';
import { translate } from '@/i18n';
import { OfferingStateCell } from '@/marketplace/offerings/list/OfferingStateCell';
import { getStates } from '@/marketplace/offerings/list/OfferingStateFilter';
import { useFullPage } from '@/navigation/context';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { AvailableOfferingCard } from '@/proposals/AvailableOfferingCard';
import { createFetcher } from '@/table/api';
import {
  MarketplaceProviderOfferingsFilter,
  MarketplaceProviderOfferingsFilterFormId,
  MarketplaceProviderOfferingsFilterInitialValues,
  selectMarketplaceProviderOfferingsFilter,
} from '@/table/generated/MarketplaceProviderOfferingsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const CallsAvailableOfferingsTable: FunctionComponent = () => {
  const values = useFilterValues('PublicAvailableOfferingsList');

  const stateFilter = useMemo(
    () => selectMarketplaceProviderOfferingsFilter(values),
    [values],
  );

  const filter = useMemo(
    () => ({ ...stateFilter, open_for_proposals: true }),
    [stateFilter],
  );

  const tableProps = useTable({
    table: 'PublicAvailableOfferingsList',
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplacePublicOfferingsList),
    queryField: 'name',
    filter,
    initialFilters: MarketplaceProviderOfferingsFilterInitialValues,
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
      gridClassName="lg:grid-cols-2 xl:grid-cols-3"
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

      <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'mt-16 mb-8')}>
        <CallsAvailableOfferingsTable />
      </div>
    </>
  );
};
