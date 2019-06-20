import marketplaceOrdersList from './OrdersList';
import marketplaceOrderDetails from './OrderDetailsContainer';
import marketplaceTermsOfServiceDialog from './TermsOfServiceDialog';
import marketplaceOrderItemDetails from './item/details/OrderItemDetailsContainer';
import orderItemListModule from './item/list/module';
import marketplacePendingOrderDropdown from '../orders/PendingOrderDropdown';

export default module => {
  orderItemListModule(module);
  module.component('marketplaceOrdersList', marketplaceOrdersList);
  module.component('marketplaceOrderDetails', marketplaceOrderDetails);
  module.component('marketplaceOrderItemDetails', marketplaceOrderItemDetails);
  module.component('marketplaceTermsOfServiceDialog', marketplaceTermsOfServiceDialog);
  module.component('marketplacePendingOrderDropdown', marketplacePendingOrderDropdown);
};
