import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  getCategories,
  getCategoryGroup,
} from '@waldur/marketplace/common/api';
import { useFullPage } from '@waldur/navigation/context';

import { useMarketplacePublicTabs } from '../utils';

import { CategoryGroupOfferingsList } from './CategoryGroupOfferingsList';
import { HeroSection } from './HeroSection';

export const CategoryGroupPage: FunctionComponent = () => {
  const {
    params: { group_uuid },
  } = useCurrentStateAndParams();
  const categoryGroup = useQuery({
    queryKey: ['CategoryGroupPage', group_uuid],
    queryFn: () =>
      Promise.all([
        getCategoryGroup(group_uuid),
        getCategories({ params: { group_uuid } }),
      ]).then(([group, categories]) => ({
        ...group,
        categories,
      })),
  });
  useFullPage();

  useMarketplacePublicTabs();

  if (categoryGroup.isLoading) {
    return <LoadingSpinner />;
  }

  if (categoryGroup.isError || !categoryGroup.data) {
    return <h3>{translate('Unable to load category')}</h3>;
  }

  return (
    <>
      <HeroSection item={categoryGroup.data} />
      <div className="container-fluid py-20">
        <CategoryGroupOfferingsList categoryGroup={categoryGroup.data} />
      </div>
    </>
  );
};
