import actionConfig from './actions';
import detailsModule from './details/module';
import quotaPie from './quota-pie';
import slurmRoutes from './routes';
import slurmAllocationList from './slurm-allocation-list';
import SlurmAllocationService from './slurm-allocation-service';
import SlurmPackagesService from './slurm-packages-service';
import registerTableExtension from './table-extension';
import tabsConfig from './tabs';
import './provider';
import './register-header';
import './marketplace';

export default module => {
  module.config(slurmRoutes);
  module.config(actionConfig);
  module.config(tabsConfig);
  module.run(registerTableExtension);
  module.service('SlurmAllocationService', SlurmAllocationService);
  module.service('SlurmPackagesService', SlurmPackagesService);
  module.component('slurmAllocationList', slurmAllocationList);
  module.directive('quotaPie', quotaPie);
  detailsModule(module);
};
