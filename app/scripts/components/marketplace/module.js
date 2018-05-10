import routes from './routes';
import marketplaceLanding from './LandingPage';

export default module => {
  module.component('marketplaceLanding', marketplaceLanding);
  module.config(routes);
};
