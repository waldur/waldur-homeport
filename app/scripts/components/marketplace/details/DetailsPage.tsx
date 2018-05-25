import * as React from 'react';

import { ngInjector } from '@waldur/core/services';
import { products } from '@waldur/marketplace/fixtures';
import { connectAngularComponent } from '@waldur/store/connect';

import { ProductDetails } from './ProductDetails';

class ProductDetailsPage extends React.Component {
  product = products[0];

  componentDidMount() {
    const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
    const titleService = ngInjector.get('titleService');

    BreadcrumbsService.activeItem = this.product.title;
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
        label: this.product.category,
        state: 'marketplace-list',
      },
    ];
    titleService.setTitle(this.product.title);
  }

  render() {
    return <ProductDetails product={this.product}/>;
  }
}

export default connectAngularComponent(ProductDetailsPage);
