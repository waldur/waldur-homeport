import marketplaceOrderItemsList from './OrderItemsContainer';
import marketplaceMyOrderItemsList from './MyOrderItemsContainer';
import marketplaceSupportOrderItemsList from './SupportOrderItemsContainer';
import marketplaceResourceOrderItems from './ResourceOrderItems';

export default module => {
  module.component('marketplaceOrderItemsList', marketplaceOrderItemsList);
  module.component('marketplaceMyOrderItemsList', marketplaceMyOrderItemsList);
  module.component('marketplaceSupportOrderItemsList', marketplaceSupportOrderItemsList);
  module.component('marketplaceResourceOrderItems', marketplaceResourceOrderItems);
};
