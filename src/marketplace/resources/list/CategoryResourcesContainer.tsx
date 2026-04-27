import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { useAsync } from 'react-use';
import { marketplaceCategoriesRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { CategoryResourcesList } from './CategoryResourcesList';

export const CategoryResourcesContainer: React.FC = () => {
  const {
    params: { category_uuid },
  } = useCurrentStateAndParams();

  const { loading, value, error } = useAsync(
    () =>
      marketplaceCategoriesRetrieve({
        path: { uuid: category_uuid },
        query: { field: ['columns', 'title'] },
      }).then((response) => response.data),
    [category_uuid],
  );

  if (loading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <>{translate('Unable to load category details')}</>;
  } else {
    return (
      <CategoryResourcesList
        columns={value.columns}
        category_uuid={category_uuid}
        category_title={value.title}
        standalone
      />
    );
  }
};
