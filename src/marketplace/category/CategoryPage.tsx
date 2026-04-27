import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { marketplaceCategoriesRetrieve } from 'waldur-js-client';

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
import { useMarketplacePublicTabs } from '../utils';

import { CategoryOfferingsList } from './CategoryOfferingsList';
import { HeroSection } from './HeroSection';

export const CategoryPage: FunctionComponent = () => {
  const {
    params: { category_uuid },
  } = useCurrentStateAndParams();
  const category = useQuery({
    queryKey: ['CategoryData', category_uuid],
    queryFn: () =>
      marketplaceCategoriesRetrieve({ path: { uuid: category_uuid } }).then(
        (response) => response.data,
      ),
  });

  useFullPage();

  useMarketplacePublicTabs();

  const cardStyle: CardStyleType =
    (ENV.plugins.WALDUR_CORE.MARKETPLACE_CARD_STYLE as CardStyleType) ||
    'detailed';

  const filters = useSelector(getMarketplaceFilters);
  useToolbarActions(<MarketplaceLandingFilter />, []);
  useExtraToolbar(filters.length ? <PageBarFilters /> : null, [filters]);
  useTitle(category?.data?.title);

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
    () => [
      {
        key: 'marketplace',
        text: translate('Marketplace'),
        to: 'public.marketplace-landing',
      },
      {
        key: 'category',
        text: category?.data?.title || translate('Category'),
        active: true,
        truncate: true,
      },
    ],
    [category?.data?.title],
  );
  useBreadcrumbs(breadcrumbItems);

  if (category.isLoading) {
    return <LoadingSpinner />;
  }

  if (category.isError || !category.data) {
    return <h3>{translate('Unable to load category')}</h3>;
  }

  return (
    <CardStyleProvider cardStyle={cardStyle}>
      <HeroSection item={category.data} />
      <div className="container-fluid py-6">
        <CategoryOfferingsList category={category.data} />
      </div>
    </CardStyleProvider>
  );
};
