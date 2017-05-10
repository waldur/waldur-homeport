import costPlansList from './cost-plans-list';
import costPlanDialog from './cost-plan-dialog';
import costPlanItems from './cost-plan-items';
import costPlanCertifications from './cost-plan-certifications';
import costPlanComponent from './cost-plan-component';
import costPlanFlavors from './cost-plan-flavors';
import costPlanOptimizer from './cost-plan-optimizer';
import costPlansService from './cost-plans-service';
import costPlanOptimizerService from './cost-plan-optimizer-service';
import costPresetsService from './cost-presets-service';
import certificationsService from './certifications-service';

export default module => {
  module.component('costPlansList', costPlansList);
  module.component('costPlanDialog', costPlanDialog);
  module.component('costPlanItems', costPlanItems);
  module.component('costPlanCertifications', costPlanCertifications);
  module.component('costPlanComponent', costPlanComponent);
  module.component('costPlanFlavors', costPlanFlavors);
  module.component('costPlanOptimizer', costPlanOptimizer);
  module.service('costPlansService', costPlansService);
  module.service('costPlanOptimizerService', costPlanOptimizerService);
  module.service('costPresetsService', costPresetsService);
  module.service('certificationsService', certificationsService);
};
