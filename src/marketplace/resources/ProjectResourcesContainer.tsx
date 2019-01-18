import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state, ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getCategory } from '@waldur/marketplace/common/api';
import { CategoryColumn } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { ProjectResourcesList } from './ProjectResourcesList';

interface State {
  loading: boolean;
  erred: boolean;
  columns: CategoryColumn[];
}

export class ProjectResourcesContainer extends React.Component<{}, State> {
  state = {
    loading: true,
    erred: false,
    columns: [],
  };

  async componentDidMount() {
    try {
      const category = await getCategory($state.params.category_uuid, {params: {field: ['columns', 'title']}});
      this.setState({
        loading: false,
        erred: false,
        columns: category.columns,
      });

      const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
      const titleService = ngInjector.get('titleService');
      const $timeout = ngInjector.get('$timeout');

      $timeout(() => {
        BreadcrumbsService.activeItem = category.title;
        titleService.setTitle(translate('{category} resources', {category: category.title}));
      });
    } catch {
      this.setState({
        loading: false,
        erred: true,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner/>;
    } else if (this.state.erred) {
      return translate('Unable to load marketplace category details');
    } else {
      return (
        <ProjectResourcesList
          columns={this.state.columns}
          category_uuid={$state.params.category_uuid}
        />
      );
    }
  }
}

export default connectAngularComponent(ProjectResourcesContainer);
