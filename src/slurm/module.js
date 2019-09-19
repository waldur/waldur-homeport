import slurmRoutes from './routes';
import actionConfig from './actions';
import tabsConfig from './tabs';
import registerSidebarExtension from './sidebar';
import registerTableExtension from './table-extension';
import SlurmAllocationService from './slurm-allocation-service';
import SlurmPackagesService from './slurm-packages-service';
import slurmAllocationList from './slurm-allocation-list';
import quotaPie from './quota-pie';
import detailsModule from './details/module';
import './provider';
import './register-header';
import './marketplace';

export default module => {
  module.config(slurmRoutes);
  module.config(actionConfig);
  module.config(tabsConfig);
  module.run(registerSidebarExtension);
  module.run(registerTableExtension);
  module.service('SlurmAllocationService', SlurmAllocationService);
  module.service('SlurmPackagesService', SlurmPackagesService);
  module.component('slurmAllocationList', slurmAllocationList);
  module.directive('quotaPie', quotaPie);
  detailsModule(module);
};
