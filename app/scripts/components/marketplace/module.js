import routes from './routes';
import marketplaceLanding from './LandingPage';
import marketplaceCompare from './ComparisonContainer';

export default module => {
  module.component('marketplaceLanding', marketplaceLanding);
  module.component('marketplaceCompare', marketplaceCompare);
  module.config(routes);
};
