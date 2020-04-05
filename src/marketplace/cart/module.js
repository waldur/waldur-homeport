import marketplaceCheckout from './CheckoutPage';
import marketplaceShoppingCartItemUpdate from './ShoppingCartItemUpdate';

export default module => {
  module.component('marketplaceCheckout', marketplaceCheckout);
  module.component(
    'marketplaceShoppingCartItemUpdate',
    marketplaceShoppingCartItemUpdate,
  );
};
