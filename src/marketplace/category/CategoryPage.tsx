import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCategory } from '@waldur/marketplace/common/api';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

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
  useTitle(
    category.data ? category.data.title : translate('Marketplace offerings'),
  );

  useMarketplacePublicTabs();

  if (category.isLoading) {
    return <LoadingSpinner />;
  }

  if (category.isError || !category.data) {
    return <h3>{translate('Unable to load category')}</h3>;
  }

  return (
    <div className="marketplace-category-page">
      <HeroSection item={category.data} />
      <div className="container-xxl py-20">
        <CategoryOfferingsList category={category.data} />
      </div>
    </div>
  );
};
