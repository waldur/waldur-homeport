import providerState from './provider-state';
import providersList from './provider-list';
import providerCreate from './create';
import detailsModule from './details/module';
import ncServiceUtils from './utils';
import providerIcon from './provider-icon';
import CategoriesService from './categories-service';

export default module => {
  module.component('providerState', providerState);
  module.component('providersList', providersList);
  module.component('providerCreate', providerCreate);
  module.component('providerIcon', providerIcon);
  module.service('ncServiceUtils', ncServiceUtils);
  module.service('CategoriesService', CategoriesService);
  detailsModule(module);
};
