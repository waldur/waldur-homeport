import actionsModule from './actions/module';
import resourceHeader from './resource-header';
import resourceDetails from './ResourceDetails';
import resourceRoutes from './routes';
import supportModule from './support/module';
import './events';

export default module => {
  module.component('resourceDetails', resourceDetails);
  module.component('resourceHeader', resourceHeader);
  module.config(resourceRoutes);
  actionsModule(module);
  supportModule(module);
};
