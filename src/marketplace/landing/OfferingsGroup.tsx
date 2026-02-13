import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import {
  Customer,
  marketplacePublicOfferingsList,
  MarketplacePublicOfferingsListData,
  Project,
} from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { OfferingCard } from '../common/OfferingCard';

import {
  getContextFiltersForOfferings,
  getMarketplaceFilters,
} from './filter/store/selectors';

const mandatoryFields: MarketplacePublicOfferingsListData['query']['field'] = [
  'uuid',
  'name',
  'description',
  'thumbnail',
  'image',
  'order_count',
  'category_uuid',
  'attributes',
  'customer_name',
  'customer_uuid',
  'state',
  'shared',
  'paused_reason',
  'tags',
];

const mapStateToFilter = createSelector<
  RootState,
  Customer,
  Project,
  any,
  MarketplacePublicOfferingsListData['query']
>(
  getCustomer,
  getProject,
  getMarketplaceFilters,
  (customer, project, marketplaceFilters) => {
    let contextFilter = getContextFiltersForOfferings(marketplaceFilters);
    if (!contextFilter) {
      contextFilter = {
        allowed_customer_uuid: customer?.uuid,
        project_uuid: project?.uuid,
      };
    }
    return {
      page_size: 6,
      state: ['Active', 'Paused'],
      ...contextFilter,
    };
  },
);

export const OfferingsGroup = () => {
  const filter = useSelector(mapStateToFilter);
  const tableProps = useTable({
    table: 'marketplace-landing-offerings',
    filter,
    fetchData: createFetcher(marketplacePublicOfferingsList),
    staleTime: 3 * 60 * 1000,
    mandatoryFields,
  });

  return (
    <Table
      {...tableProps}
      gridItem={({ row }) => <OfferingCard offering={row} />}
      gridSize={{ lg: 6, xl: 4 }}
      hoverShadow={{ grid: false }}
      mode="grid"
      title={translate('Latest offerings')}
      verboseName={translate('Offerings')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      tableActions={
        <Link state="public.offerings" className="btn btn-tertiary">
          {translate('All offerings')}
        </Link>
      }
      hasQuery={false}
      hasPagination={false}
    />
  );
};
