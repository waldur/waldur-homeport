import marketplaceMyOrderItemsList from './MyOrderItemsContainer';
import marketplaceOrderItemsList from './OrderItemsContainer';
import marketplaceSupportOrderItemsList from './SupportOrderItemsContainer';

export default module => {
  module.component('marketplaceOrderItemsList', marketplaceOrderItemsList);
  module.component('marketplaceMyOrderItemsList', marketplaceMyOrderItemsList);
  module.component(
    'marketplaceSupportOrderItemsList',
    marketplaceSupportOrderItemsList,
  );
};
