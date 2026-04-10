import { useMemo } from 'react';
import { ColProps } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { MarketplacePublicOfferingsListData } from 'waldur-js-client';

import { CardStyleType } from '@waldur/marketplace/common/cards';
import { RootState } from '@waldur/store/reducers';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import {
  getContextFiltersForOfferings,
  getMarketplaceFilters,
} from './filter/store/selectors';

export const OFFERING_CARD_MANDATORY_FIELDS: MarketplacePublicOfferingsListData['query']['field'] =
  [
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
    'is_accessible',
  ];

const createOfferingListFilterSelector = (
  pageSize: number,
  additionalFilters?: Record<string, unknown>,
) =>
  createSelector(
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
        page_size: pageSize,
        state: ['Active', 'Paused'],
        ...additionalFilters,
        ...contextFilter,
      } as MarketplacePublicOfferingsListData['query'];
    },
  );

export const useOfferingListFilter = (
  pageSize: number,
  additionalFilters?: Record<string, unknown>,
) => {
  const selector = useMemo(
    () => createOfferingListFilterSelector(pageSize, additionalFilters),
    [pageSize, additionalFilters],
  );
  return useSelector<RootState, MarketplacePublicOfferingsListData['query']>(
    selector,
  );
};

export const getOfferingGridSize = (cardStyle: CardStyleType): ColProps =>
  cardStyle === 'list'
    ? { xs: 12 }
    : cardStyle === 'compact'
      ? { xs: 6, sm: 4, md: 4, lg: 3 }
      : { lg: 6, xl: 4 };
