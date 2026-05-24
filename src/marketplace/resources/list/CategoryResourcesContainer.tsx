import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { marketplaceCategoriesRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { CategoryResourcesList } from './CategoryResourcesList';

export const CategoryResourcesContainer: React.FC = () => {
  const {
    params: { category_uuid },
  } = useCurrentStateAndParams();

  const {
    isLoading: loading,
    data,
    error,
  } = useQuery({
    queryKey: ['CategoryResourcesContainer', category_uuid],

    queryFn: () =>
      marketplaceCategoriesRetrieve({
        path: { uuid: category_uuid },
        query: { field: ['columns', 'title'] },
      }).then((response) => response.data),
  });

  if (loading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <>{translate('Unable to load category details')}</>;
  } else {
    return (
      <CategoryResourcesList
        columns={data.columns as any}
        category_uuid={category_uuid}
        category_title={data.title}
        standalone
      />
    );
  }
};
