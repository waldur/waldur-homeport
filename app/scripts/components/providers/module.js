import providerUtils from './provider-utils-service';
import providerState from './provider-state';
import ProviderListController from './list';
import providerCreate from './create';
import detailsModule from './details/module';

export default module => {
  module.service('providerUtils', providerUtils);
  module.component('providerState', providerState);
  module.controller('ProviderListController', ProviderListController);
  module.directive('providerCreate', providerCreate);
  detailsModule(module);
};
