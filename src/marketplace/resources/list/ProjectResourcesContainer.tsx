import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { $state, ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getCategory } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { ProjectResourcesList } from './ProjectResourcesList';

// tslint:disable-next-line: variable-name
async function loadData(category_uuid) {
  const category = await getCategory(category_uuid, {params: {field: ['columns', 'title']}});
  updateBreadcrumbs(category);
  return {columns: category.columns};
}

function updateBreadcrumbs(category: Category) {
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  const titleService = ngInjector.get('titleService');
  const $timeout = ngInjector.get('$timeout');

  $timeout(() => {
    BreadcrumbsService.activeItem = category.title;
    titleService.setTitle(translate('{category} resources', {category: category.title}));
  });
}

export const ProjectResourcesContainer: React.SFC<{}> = () => (
  <Query loader={loadData} variables={$state.params.category_uuid}>
    {({ loading, data, error }) => {
      if (loading) {
        return <LoadingSpinner/>;
      } else if (error) {
        return <span>{translate('Unable to load marketplace category details')}</span>;
      } else {
        return (
          <ProjectResourcesList
            columns={data.columns}
            category_uuid={$state.params.category_uuid}
          />
        );
      }
    }}
  </Query>
);

export default connectAngularComponent(ProjectResourcesContainer);
