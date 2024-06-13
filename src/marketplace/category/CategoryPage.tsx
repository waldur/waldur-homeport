import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCategory } from '@waldur/marketplace/common/api';
import {
  useExtraToolbar,
  useFullPage,
  useToolbarActions,
} from '@waldur/navigation/context';

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
    queryKey: ['CategoryPage', category_uuid],
    queryFn: () => getCategory(category_uuid),
  });
  useFullPage();

  useMarketplacePublicTabs();

  const filters = useSelector(getMarketplaceFilters);
  useToolbarActions(<MarketplaceLandingFilter />);
  useExtraToolbar(filters.length ? <PageBarFilters /> : null);

  if (category.isLoading) {
    return <LoadingSpinner />;
  }

  if (category.isError || !category.data) {
    return <h3>{translate('Unable to load category')}</h3>;
  }

  return (
    <>
      <HeroSection item={category.data} />
      <div className="container-fluid py-20">
        <CategoryOfferingsList category={category.data} />
      </div>
    </>
  );
};
