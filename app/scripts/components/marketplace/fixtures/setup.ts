import { addItem as addCartItem } from '@waldur/marketplace/cart/store/actions';
import { addItem as addCompareItem } from '@waldur/marketplace/compare/store/actions';
import store from '@waldur/store/store';

import { products } from './index';

export function setupFixture() {
  for (const product of products) {
    store.dispatch(addCartItem(product));
    store.dispatch(addCompareItem(product));
  }
}
