import marketplaceCheckout from './CheckoutPage';
import cartIndicator from './ShoppingCartIndicator';
import marketplaceShoppingCartItemUpdate from './ShoppingCartItemUpdate';

export default module => {
  module.component('marketplaceCheckout', marketplaceCheckout);
  module.component('cartIndicator', cartIndicator);
  module.component('marketplaceShoppingCartItemUpdate', marketplaceShoppingCartItemUpdate);
};
