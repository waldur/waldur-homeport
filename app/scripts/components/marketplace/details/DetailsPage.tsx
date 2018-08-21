import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getOffering, getCategory } from '@waldur/marketplace/common/api';
import { connectAngularComponent } from '@waldur/store/connect';

import { OfferingDetails } from './OfferingDetails';

class OfferingDetailsPage extends React.Component {
  state = {
    offering: null,
    category: null,
    loading: true,
    erred: false,
  };

  componentDidMount() {
    this.fetchOffering();
  }

  async fetchOffering() {
    const $stateParams = ngInjector.get('$stateParams');
    try {
      const offering = await getOffering($stateParams.offering_uuid);
      const category = await getCategory(offering.category_uuid);
      this.setState({offering, category, loading: false, erred: false});
      this.updateBreadcrumbs(offering);
    } catch (error) {
      this.setState({loading: false, erred: true});
    }
  }

  updateBreadcrumbs(offering) {
    const $timeout = ngInjector.get('$timeout');
    const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
    const titleService = ngInjector.get('titleService');

    $timeout(() => {
      BreadcrumbsService.activeItem = offering.name;
      BreadcrumbsService.items = [
        {
          label: translate('Project workspace'),
          state: 'project.details',
        },
        {
          label: translate('Marketplace'),
          state: 'marketplace-landing',
        },
        {
          label: offering.category_title,
          state: 'marketplace-list',
          params: {
            category_uuid: offering.category_uuid,
          },
        },
      ];
      titleService.setTitle(offering.name);
    });
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner/>;
    }
    if (this.state.erred) {
      return translate('Unable to load offering details.');
    }
    return <OfferingDetails offering={this.state.offering} category={this.state.category}/>;
  }
}

export default connectAngularComponent(OfferingDetailsPage);
