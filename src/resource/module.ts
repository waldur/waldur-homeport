import actionsModule from './actions/module';
import resourceHeader from './resource-header';
import resourceDetails from './ResourceDetails';
import './events';

export default module => {
  module.component('resourceDetails', resourceDetails);
  module.component('resourceHeader', resourceHeader);
  actionsModule(module);
};
