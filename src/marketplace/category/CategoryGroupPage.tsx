import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import {
  marketplaceCategoriesList,
  marketplaceCategoryGroupsRetrieve,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

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
  useTitle(queryResult?.data?.title);

  if (queryResult.isLoading) {
    return <LoadingSpinner />;
  }

  if (queryResult.isError || !queryResult.data) {
    return <h3>{translate('Unable to load category')}</h3>;
  }

  return (
    <>
      <HeroSection item={queryResult.data} />
      <div className="container-fluid py-20">
        <CategoryGroupOfferingsList categoryGroup={queryResult.data} />
      </div>
    </>
  );
};
