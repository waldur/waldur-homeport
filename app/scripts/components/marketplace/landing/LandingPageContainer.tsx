import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { CategoriesListType, ProductsListType } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { LandingPage } from './LandingPage';
import * as actions from './store/actions';
import * as selectors from './store/selectors';

interface LandingPageContainerProps {
  getCategories: () => void;
  getProducts: () => void;
  categories: CategoriesListType;
  products: ProductsListType;
}

export class LandingPageContainer extends React.Component<LandingPageContainerProps & TranslateProps> {
  componentDidMount() {
    this.props.getCategories();
    this.props.getProducts();
  }

  render() {
    return <LandingPage {...this.props}/>;
  }
}

const mapDispatchToProps = dispatch => ({
  getCategories: () => dispatch(actions.getCategories()),
  getProducts: () => dispatch(actions.getProducts()),
});

const mapStateToProps = state => ({
  categories: selectors.getCategories(state),
  products: selectors.getProducts(state),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps)
);

export default connectAngularComponent(enhance(LandingPageContainer));
