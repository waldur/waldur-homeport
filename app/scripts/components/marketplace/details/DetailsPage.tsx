import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getProduct } from '@waldur/marketplace/common/api';
import { connectAngularComponent } from '@waldur/store/connect';

import { ProductDetails } from './ProductDetails';

class ProductDetailsPage extends React.Component {
  state = {
    product: null,
    loading: true,
    erred: false,
  };

  componentDidMount() {
    this.fetchProduct();
  }

  async fetchProduct() {
    const $stateParams = ngInjector.get('$stateParams');
    try {
      const product = await getProduct($stateParams.product_uuid);
      this.setState({product, loading: false, erred: false});
      this.updateBreadcrumbs(product);
    } catch (error) {
      this.setState({loading: false, erred: true});
    }
  }

  updateBreadcrumbs(product) {
    const $timeout = ngInjector.get('$timeout');
    const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
    const titleService = ngInjector.get('titleService');

    $timeout(() => {
      BreadcrumbsService.activeItem = product.name;
      BreadcrumbsService.items = [
        {
          label: 'Project workspace',
          state: 'project.details',
        },
        {
          label: 'Marketplace',
          state: 'marketplace-landing',
        },
        {
          label: product.category_title,
          state: 'marketplace-list',
        },
      ];
      titleService.setTitle(product.name);
    });
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner/>;
    }
    if (this.state.erred) {
      return translate('Unable to load offering details.');
    }
    return <ProductDetails product={this.state.product}/>;
  }
}

export default connectAngularComponent(ProductDetailsPage);
