import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { getProducts } from '@waldur/marketplace/common/api';
import { CategoriesListType, ProductsListType } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { LandingPage } from './LandingPage';
import * as actions from './store/actions';
import * as selectors from './store/selectors';

interface LandingPageContainerProps {
  getCategories: () => void;
  categories: CategoriesListType;
}

interface LandingPageContainerState {
  products: ProductsListType;
}

export class LandingPageContainer extends React.Component<LandingPageContainerProps & TranslateProps, LandingPageContainerState> {
  componentDidMount() {
    this.props.getCategories();
    this.loadProducts();
  }

  async loadProducts() {
    this.setState({
      products: {
        loading: true,
        loaded: false,
        items: [],
      },
    });
    try {
      const products = await getProducts();
      this.setState({
        products: {
          loading: false,
          loaded: true,
          items: products,
        },
      });
    } catch {
      this.setState({
        products: {
          loading: false,
          loaded: false,
          items: [],
        },
      });
    }
  }

  render() {
    return <LandingPage {...{...this.state, categories: this.props.categories}}/>;
  }
}

const mapDispatchToProps = dispatch => ({
  getCategories: () => dispatch(actions.getCategories()),
});

const mapStateToProps = state => ({
  categories: selectors.getCategories(state),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps)
);

export default connectAngularComponent(enhance(LandingPageContainer));
