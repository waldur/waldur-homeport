import actionConfig from './actions';
import detailsModule from './details/module';
import quotaPie from './quota-pie';
import SlurmPackagesService from './slurm-packages-service';
import tabsConfig from './tabs';
import './provider';
import './register-header';
import './marketplace';

export default module => {
  module.config(actionConfig);
  module.config(tabsConfig);
  module.service('SlurmPackagesService', SlurmPackagesService);
  module.directive('quotaPie', quotaPie);
  detailsModule(module);
};
