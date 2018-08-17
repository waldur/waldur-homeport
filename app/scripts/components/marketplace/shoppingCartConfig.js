import store from '@waldur/store/store';
import { setCart } from '@waldur/marketplace/cart/store/actions';

export default function () {
  let cart = localStorage.getItem('shoppingCart');
  if (cart) {
    try {
      cart = JSON.parse(cart);
      store.dispatch(setCart(cart));
    } catch(error) {
      console.log('Error parsing shopping cart\'s data', error);
    }
  }
}
