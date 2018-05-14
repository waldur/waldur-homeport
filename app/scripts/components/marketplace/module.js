import routes from './routes';
import marketplaceLanding from './LandingPage';
import marketplaceCompare from './ComparisonContainer';
import comparisonIndicator from './ComparisonIndicator';

export default module => {
  module.component('marketplaceLanding', marketplaceLanding);
  module.component('marketplaceCompare', marketplaceCompare);
  module.component('comparisonIndicator', comparisonIndicator);
  module.config(routes);
};
