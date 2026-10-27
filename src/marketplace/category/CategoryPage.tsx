import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { FunctionComponent, useMemo } from 'react';
import { marketplaceCategoriesRetrieve } from 'waldur-js-client';

import { IBreadcrumbItem, useBreadcrumbs } from 'waldur-ui';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useFullPage } from '@/navigation/context';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { useTitle } from '@/navigation/title';

import { CardStyleType } from '../common/cards/index';
import { CardStyleProvider } from '../landing/CardStyleContext';
import { MarketplaceScopeBar } from '../landing/filter/PageBarFilters';
import { getMarketplaceTitle } from '../title';
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

  useTitle(category?.data?.title);

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
    () => [
      {
        key: 'marketplace',
        text: getMarketplaceTitle(),
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
    return (
      <>
        <MarketplaceScopeBar />
        <LoadingSpinner />
      </>
    );
  }

  if (category.isError || !category.data) {
    return (
      <>
        <MarketplaceScopeBar />
        <h3>{translate('Unable to load category')}</h3>
      </>
    );
  }

  return (
    <CardStyleProvider cardStyle={cardStyle}>
      <MarketplaceScopeBar />
      <HeroSection item={category.data} />
      <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'py-5')}>
        <CategoryOfferingsList category={category.data} />
      </div>
    </CardStyleProvider>
  );
};
