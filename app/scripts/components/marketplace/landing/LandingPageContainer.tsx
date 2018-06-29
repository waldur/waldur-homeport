import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { getCategories, getProducts } from '@waldur/marketplace/common/api';
import { CategoriesListType, ProductsListType } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { LandingPage } from './LandingPage';

interface LandingPageContainerState {
  categories: CategoriesListType;
  products: ProductsListType;
  loading: boolean;
  loaded: boolean;
}

export class LandingPageContainer extends React.Component<TranslateProps, LandingPageContainerState> {
  componentDidMount() {
    this.loadAll();
  }

  async loadAll() {
    this.setState({
      categories: {
        loading: true,
        loaded: false,
        items: [],
      },
      products: {
        loading: true,
        loaded: false,
        items: [],
      },
    });
    try {
      const [categories, products] = await Promise.all([getCategories(), getProducts()]);
      this.setState({
        categories: {
          loading: false,
          loaded: true,
          items: categories,
        },
        products: {
          loading: false,
          loaded: true,
          items: products,
        },
      });
    } catch {
      this.setState({
        categories: {
          loading: false,
          loaded: false,
          items: [],
        },
        products: {
          loading: false,
          loaded: false,
          items: [],
        },
      });
    }
  }

  render() {
    return <LandingPage {...this.state}/>;
  }
}

export default connectAngularComponent(withTranslation(LandingPageContainer));
