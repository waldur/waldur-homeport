import customerSizing from './customer-sizing';
import sizing from './sizing';
import costPlansList from './cost-plans-list';
import costPlanDialog from './cost-plan-dialog';
import costPlanItems from './cost-plan-items';
import costPlansService from './cost-plans-service';
import costPresetsService from './cost-presets-service';
import certificationsService from './certifications-service';

export default module => {
  module.component('customerSizing', customerSizing);
  module.directive('sizing', sizing);
  module.component('costPlansList', costPlansList);
  module.component('costPlanDialog', costPlanDialog);
  module.component('costPlanItems', costPlanItems);
  module.service('costPlansService', costPlansService);
  module.service('costPresetsService', costPresetsService);
  module.service('certificationsService', certificationsService);
};
