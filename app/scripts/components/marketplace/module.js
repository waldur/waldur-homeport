import routes from './routes';
import marketplaceLanding from './LandingPage';
import marketplaceCompare from './ComparisonContainer';
import comparisonIndicator from './ComparisonIndicator';
import marketplaceCheckout from './CheckoutPage';
import cartIndicator from './CartIndicator';

export default module => {
  module.component('marketplaceLanding', marketplaceLanding);
  module.component('marketplaceCompare', marketplaceCompare);
  module.component('comparisonIndicator', comparisonIndicator);
  module.component('marketplaceCheckout', marketplaceCheckout);
  module.component('cartIndicator', cartIndicator);
  module.config(routes);
};
