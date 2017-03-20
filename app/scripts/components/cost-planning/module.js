import customerSizing from './customer-sizing';
import sizing from './sizing';
import costPlansList from './cost-plans-list';
import costPlanDialog from './cost-plan-dialog';
import costPlansService from './cost-plans-service';
import costPresetsService from './cost-presets-service';

export default module => {
  module.component('customerSizing', customerSizing);
  module.directive('sizing', sizing);
  module.component('costPlansList', costPlansList);
  module.component('costPlanDialog', costPlanDialog);
  module.service('costPlansService', costPlansService);
  module.service('costPresetsService', costPresetsService);
};
