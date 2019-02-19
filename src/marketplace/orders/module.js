import marketplaceOrdersList from './OrdersList';
import marketplaceOrderItemsList from './OrderItemsContainer';
import marketplaceMyOrderItemsList from './MyOrderItemsContainer';
import marketplaceSupportOrderItemsList from './SupportOrderItemsContainer';
import marketplaceOrderDetails from './OrderDetailsContainer';
import marketplaceOrderItemDetails from './OrderItemDetailsContainer';
import marketplaceResourceOrderItems from './ResourceOrderItems';

export default module => {
  module.component('marketplaceOrdersList', marketplaceOrdersList);
  module.component('marketplaceOrderItemsList', marketplaceOrderItemsList);
  module.component('marketplaceMyOrderItemsList', marketplaceMyOrderItemsList);
  module.component('marketplaceSupportOrderItemsList', marketplaceSupportOrderItemsList);
  module.component('marketplaceOrderDetails', marketplaceOrderDetails);
  module.component('marketplaceOrderItemDetails', marketplaceOrderItemDetails);
  module.component('marketplaceResourceOrderItems', marketplaceResourceOrderItems);
};
