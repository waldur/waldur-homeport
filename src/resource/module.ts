import actionsModule from './actions/module';
import resourceHeader from './resource-header';
import resourceDetails from './ResourceDetails';
import resourcesService from './resources-service';
import resourceRoutes from './routes';
import resourceStateModule from './state/module';
import supportModule from './support/module';
import './events';

export default module => {
  module.component('resourceDetails', resourceDetails);
  module.component('resourceHeader', resourceHeader);
  module.config(resourceRoutes);
  module.service('resourcesService', resourcesService);
  resourceStateModule(module);
  actionsModule(module);
  supportModule(module);
};
