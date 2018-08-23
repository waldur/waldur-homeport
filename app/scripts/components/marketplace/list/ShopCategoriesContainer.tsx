import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { $state } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';

import * as actions from '../landing/store/actions';
import * as selectors from '../landing/store/selectors';

import { ShopCategories } from './ShopCategories';

const mapStateToProps = state => ({
  categories: selectors.getCategories(state).items,
  currentCategoryUuid: $state.params.category_uuid,
});

const mapDispatchToProps = dispatch => ({
  getCategories: () => dispatch(actions.getCategories()),
});

interface ShopCategoriesWrapperProps {
  getCategories: () => void;
  categories: Category[];
}

class ShopCategoriesWrapper extends React.Component<ShopCategoriesWrapperProps> {
  componentDidMount() {
    this.props.getCategories();
  }

  render() {
    return <ShopCategories {...this.props} />;
  }
}

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
);

export const ShopCategoriesContainer = enhance(ShopCategoriesWrapper);
