import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  marketplaceCategoriesList,
  marketplaceCategoryGroupsRetrieve,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import {
  useBreadcrumbs,
  useExtraToolbar,
  useFullPage,
  useToolbarActions,
} from '@/navigation/context';
import { useTitle } from '@/navigation/title';
import { IBreadcrumbItem } from '@/navigation/types';

import { CardStyleType } from '../common/cards/index';
import { CardStyleProvider } from '../landing/CardStyleContext';
import { PageBarFilters } from '../landing/filter/PageBarFilters';
import { getMarketplaceFilters } from '../landing/filter/store/selectors';
import { MarketplaceLandingFilter } from '../landing/MarketplaceLandingFilter';
import { getMarketplaceTitle } from '../title';
import { useMarketplacePublicTabs } from '../utils';

import { CategoryGroupOfferingsList } from './CategoryGroupOfferingsList';
import { HeroSection } from './HeroSection';

export const CategoryGroupPage: FunctionComponent = () => {
  const {
    params: { group_uuid },
  } = useCurrentStateAndParams();
  const queryResult = useQuery({
    queryKey: ['CategoryGroupPage', group_uuid],
    queryFn: () =>
      Promise.all([
        marketplaceCategoryGroupsRetrieve({ path: { uuid: group_uuid } }),
        getAllPages((page) =>
          marketplaceCategoriesList({
            query: { page, page_size: MAX_PAGE_SIZE, group_uuid },
          }),
        ),
      ]).then(([groupResponse, categories]) => ({
        ...groupResponse.data,
        categories,
      })),
  });
  useFullPage();

  useMarketplacePublicTabs();

  const cardStyle: CardStyleType =
    (ENV.plugins.WALDUR_CORE.MARKETPLACE_CARD_STYLE as CardStyleType) ||
    'detailed';

  const filters = useSelector(getMarketplaceFilters);
  useToolbarActions(<MarketplaceLandingFilter />, []);
  useExtraToolbar(filters.length ? <PageBarFilters /> : null, [filters]);
  useTitle(queryResult?.data?.title);

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
    () => [
      {
        key: 'marketplace',
        text: getMarketplaceTitle(),
        to: 'public.marketplace-landing',
      },
      {
        key: 'category-group',
        text: queryResult?.data?.title || translate('Category group'),
        active: true,
        truncate: true,
      },
    ],
    [queryResult?.data?.title],
  );
  useBreadcrumbs(breadcrumbItems);

  if (queryResult.isLoading) {
    return <LoadingSpinner />;
  }

  if (queryResult.isError || !queryResult.data) {
    return <h3>{translate('Unable to load category')}</h3>;
  }

  return (
    <CardStyleProvider cardStyle={cardStyle}>
      <HeroSection item={queryResult.data} />
      <div className="container-fluid py-6">
        <CategoryGroupOfferingsList categoryGroup={queryResult.data} />
      </div>
    </CardStyleProvider>
  );
};
