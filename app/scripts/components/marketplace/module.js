import routes from './routes';
import marketplaceLanding from './landing/LandingPageContainer';
import marketplaceCompare from './compare/ComparisonContainer';
import comparisonIndicator from './compare/ComparisonIndicator';
import marketplaceCheckout from './cart/CheckoutPage';
import cartIndicator from './cart/ShoppingCartIndicator';
import marketplaceProduct from './details/DetailsPage';
import marketplaceList from './list/ListPage';
import marketplaceVendorOfferings from './offerings/OfferingsList';
import marketplaceOfferingCreate from './offerings/OfferingCreateContainer';
import marketplaceOrdersList from './orders/OrdersList';
import providersService from './providers-service';
import registerSidebarExtension from './sidebar';

export default module => {
  module.component('marketplaceLanding', marketplaceLanding);
  module.component('marketplaceCompare', marketplaceCompare);
  module.component('comparisonIndicator', comparisonIndicator);
  module.component('marketplaceCheckout', marketplaceCheckout);
  module.component('cartIndicator', cartIndicator);
  module.component('marketplaceProduct', marketplaceProduct);
  module.component('marketplaceList', marketplaceList);
  module.component('marketplaceVendorOfferings', marketplaceVendorOfferings);
  module.component('marketplaceOfferingCreate', marketplaceOfferingCreate);
  module.component('marketplaceOrdersList', marketplaceOrdersList);
  module.service('providersService', providersService);
  module.config(routes);
  module.run(registerSidebarExtension);
};
