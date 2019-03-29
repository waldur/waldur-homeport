import resourcesTreemap from './ChartContainer';
import routes from './routes';
import supportSharedProviders from './SharedProviderContainer';

export default module => {
  module.config(routes);
  module.component('resourcesTreemap', resourcesTreemap);
  module.component('supportSharedProviders', supportSharedProviders);
};
