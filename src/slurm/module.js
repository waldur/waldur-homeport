import actionConfig from './actions';
import detailsModule from './details/module';
import quotaPie from './quota-pie';
import SlurmPackagesService from './slurm-packages-service';
import registerTableExtension from './table-extension';
import tabsConfig from './tabs';
import './provider';
import './register-header';
import './marketplace';

export default module => {
  module.config(actionConfig);
  module.config(tabsConfig);
  module.run(registerTableExtension);
  module.service('SlurmPackagesService', SlurmPackagesService);
  module.directive('quotaPie', quotaPie);
  detailsModule(module);
};
