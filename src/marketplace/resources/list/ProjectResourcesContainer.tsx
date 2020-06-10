import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCategory } from '@waldur/marketplace/common/api';
import { useTitle } from '@waldur/navigation/title';

import { ProjectResourcesList } from './ProjectResourcesList';

async function loadData(category_uuid) {
  const category = await getCategory(category_uuid, {
    params: { field: ['columns', 'title'] },
  });
  return { columns: category.columns, title: category.title };
}

export const ProjectResourcesContainer: React.FC<{}> = () => {
  const {
    params: { category_uuid },
  } = useCurrentStateAndParams();

  const { loading, value, error } = useAsync(() => loadData(category_uuid), [
    category_uuid,
  ]);

  useTitle(
    value
      ? translate('{category} resources', { category: value.title })
      : translate('Project resources'),
  );

  if (loading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <>{translate('Unable to load marketplace category details')}</>;
  } else {
    return (
      <ProjectResourcesList
        columns={value.columns}
        category_uuid={category_uuid}
      />
    );
  }
};
