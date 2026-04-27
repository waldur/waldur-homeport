import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  marketplacePublicOfferingsList,
  MarketplacePublicOfferingsListData,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { Link } from '@/core/Link';
import { LandingHeroSection } from '@/dashboard/hero/LandingHeroSection';
import { translate } from '@/i18n';
import { OfferingStateCell } from '@/marketplace/offerings/list/OfferingStateCell';
import { getStates } from '@/marketplace/offerings/list/OfferingStateFilter';
import { PUBLIC_OFFERINGS_FILTER_FORM_ID } from '@/marketplace/offerings/store/constants';
import { useFullPage } from '@/navigation/context';
import { AvailableOfferingCard } from '@/proposals/AvailableOfferingCard';
import { createFetcher } from '@/table/api';
import { MarketplaceProviderOfferingsFilter } from '@/table/generated/MarketplaceProviderOfferingsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const mapStateToFilter = createSelector(
  getFormValues(PUBLIC_OFFERINGS_FILTER_FORM_ID),
  (filters: any) => {
    const result: MarketplacePublicOfferingsListData['query'] = {};

    if (filters) {
      if (filters.state) {
        result.state = filters.state.map((option) => option.value);
      }
    }
    result.accessible_via_calls = true;
    return result;
  },
);

export const CallsAvailableOfferingsPage: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);
  useFullPage();

  const tableProps = useTable({
    table: 'PublicAvailableOfferingsList',
    fetchData: createFetcher(marketplacePublicOfferingsList),
    queryField: 'name',
    filter,
  });

  return (
    <>
      <LandingHeroSection
        header={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        title={translate('Available offerings')}
        context="calls"
      />

      <div className="container-fluid mt-20 mb-10">
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
          gridItem={({ row }) => (
            <AvailableOfferingCard availableOffering={row} />
          )}
          gridSize={{ lg: 6, xl: 4 }}
          hoverShadow={{ grid: false }}
          verboseName={translate('Available offerings')}
          initialSorting={{ field: 'name', mode: 'desc' }}
          hasQuery={true}
          filters={<MarketplaceProviderOfferingsFilter />}
        />
      </div>
    </>
  );
};
