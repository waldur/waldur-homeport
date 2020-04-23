import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getCategory } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';

import { ProjectResourcesList } from './ProjectResourcesList';

function updateBreadcrumbs(category: Category) {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  const titleService = ngInjector.get('titleService');
  const $timeout = ngInjector.get('$timeout');

  $timeout(() => {
    BreadcrumbsService.activeItem = category.title;
    titleService.setTitle(
      translate('{category} resources', { category: category.title }),
    );
  });
}

async function loadData(category_uuid) {
  const category = await getCategory(category_uuid, {
    params: { field: ['columns', 'title'] },
  });
  updateBreadcrumbs(category);
  return { columns: category.columns };
}

export const ProjectResourcesContainer: React.FC<{}> = () => {
  const {
    params: { category_uuid },
  } = useCurrentStateAndParams();

  const { loading, value, error } = useAsync(() => loadData(category_uuid), [
    category_uuid,
  ]);

  if (loading) {
    return <LoadingSpinner />;
  } else if (error) {
    return (
      <span>{translate('Unable to load marketplace category details')}</span>
    );
  } else {
    return (
      <ProjectResourcesList
        columns={value.columns}
        category_uuid={category_uuid}
      />
    );
  }
};
