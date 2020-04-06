import marketplaceOrderItemDetails from './item/details/OrderItemDetailsContainer';
import orderItemListModule from './item/list/module';
import marketplaceOrderDetails from './OrderDetailsContainer';
import marketplaceOrdersList from './OrdersList';
import marketplaceTermsOfServiceDialog from './TermsOfServiceDialog';

export default module => {
  orderItemListModule(module);
  module.component('marketplaceOrdersList', marketplaceOrdersList);
  module.component('marketplaceOrderDetails', marketplaceOrderDetails);
  module.component('marketplaceOrderItemDetails', marketplaceOrderItemDetails);
  module.component(
    'marketplaceTermsOfServiceDialog',
    marketplaceTermsOfServiceDialog,
  );
};
