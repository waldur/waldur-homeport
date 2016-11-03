import ProviderListController from './list';
import providerCreate from './create';
import detailsModule from './details/module';

export default module => {
  module.controller('ProviderListController', ProviderListController);
  module.directive('providerCreate', providerCreate);
  detailsModule(module);
}
