import providerState from './provider-state';
import providersList from './provider-list';
import providerCreate from './create';
import detailsModule from './details/module';

export default module => {
  module.component('providerState', providerState);
  module.component('providersList', providersList);
  module.component('providerCreate', providerCreate);
  detailsModule(module);
};
