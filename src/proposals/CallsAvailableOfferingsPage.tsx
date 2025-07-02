import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { MarketplacePublicOfferingsListData } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { Link } from '@waldur/core/Link';
import { LandingHeroSection } from '@waldur/dashboard/hero/LandingHeroSection';
import { translate } from '@waldur/i18n';
import { OfferingsFilter } from '@waldur/marketplace/offerings/list/OfferingsFilter';
import { OfferingStateCell } from '@waldur/marketplace/offerings/list/OfferingStateCell';
import { getStates } from '@waldur/marketplace/offerings/list/OfferingStateFilter';
import { PUBLIC_OFFERINGS_FILTER_FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { useFullPage } from '@waldur/navigation/context';
import { AvailableOfferingCard } from '@waldur/proposals/AvailableOfferingCard';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

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
    fetchData: createFetcher('marketplace-public-offerings'),
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
          filters={<OfferingsFilter />}
        />
      </div>
    </>
  );
};
