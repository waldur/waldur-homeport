import slurmRoutes from './routes';
import slurmAllocationConfig from './slurm-allocation-config';
import registerSidebarExtension from './sidebar';
import SlurmAllocationService from './slurm-allocation-service';
import slurmAllocationList from './slurm-allocation-list';

export default module => {
  module.config(slurmRoutes);
  module.config(slurmAllocationConfig);
  module.run(registerSidebarExtension);
  module.service('SlurmAllocationService', SlurmAllocationService);
  module.component('slurmAllocationList', slurmAllocationList);
};
