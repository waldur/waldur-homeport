import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCategory } from '@waldur/marketplace/common/api';

import { CategoryResourcesList } from './CategoryResourcesList';

export const CategoryResourcesContainer: React.FC = () => {
  const {
    params: { category_uuid },
  } = useCurrentStateAndParams();

  const { loading, value, error } = useAsync(
    () =>
      getCategory(category_uuid, {
        params: { field: ['columns', 'title'] },
      }),
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
