import { connect } from 'react-redux';

import { $state } from '@waldur/core/services';

import * as selectors from '../landing/store/selectors';
import { ShopCategories } from './ShopCategories';

const enhance = connect(state => ({
  categories: selectors.getCategories(state).items,
  currentCategoryUuid: $state.params.category_uuid,
}));

export const ShopCategoriesContainer = enhance(ShopCategories);
