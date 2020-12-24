import { connect } from 'react-redux';

import { router } from '@waldur/router';

import * as selectors from '../landing/store/selectors';

import { ShopCategories } from './ShopCategories';

const enhance = connect((state) => ({
  categories: selectors.getCategories(state).items,
  currentCategoryUuid: router.stateService.params.category_uuid,
}));

export const ShopCategoriesContainer = enhance(ShopCategories);
