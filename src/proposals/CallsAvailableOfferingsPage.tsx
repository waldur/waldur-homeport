import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { LandingHeroSection } from '@waldur/dashboard/hero/LandingHeroSection';
import { translate } from '@waldur/i18n';
import { OfferingsFilter } from '@waldur/marketplace/offerings/list/OfferingsFilter';
import { OfferingStateCell } from '@waldur/marketplace/offerings/list/OfferingStateCell';
import { PUBLIC_OFFERINGS_FILTER_FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { AvailableOfferingCard } from '@waldur/proposals/AvailableOfferingCard';
import { PublicAvailableOfferingsTablePlaceholder } from '@waldur/proposals/PublicAvailableOfferingsTablePlaceholder';
import { createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

const background = require('./proposal-calls.png');

const mapStateToFilter = createSelector(
  getFormValues(PUBLIC_OFFERINGS_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};

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
  useTitle(translate('All available offerings'));

  const tableProps = useTable({
    table: 'PublicAvailableOfferingsList',
    fetchData: createFetcher('marketplace-public-offerings'),
    queryField: 'name',
    filter,
  });

  return (
    <div className="public-calls-page">
      <LandingHeroSection
        header={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        title={translate('Available offerings')}
        backgroundImage={background}
      />
      <div className="container-xxl mt-20">
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
            },
          ]}
          gridItem={({ row }) => (
            <AvailableOfferingCard availableOffering={row} />
          )}
          gridSize={{ lg: 6, xl: 4 }}
          verboseName={translate('Available offerings')}
          initialSorting={{ field: 'name', mode: 'desc' }}
          hasQuery={true}
          placeholderComponent={<PublicAvailableOfferingsTablePlaceholder />}
          filters={<OfferingsFilter />}
        />
      </div>
    </div>
  );
};