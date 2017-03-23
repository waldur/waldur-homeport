import { premiumSupportPlansService, premiumSupportContractsService} from './premium-support-service';
import longread from './longread';
import premiumSupportProvision from './premium-support-provision';
import premiumSupportAgreement from './premium-support-agreement';
import premiumSupportPlans from './premium-support-plans';
import premiumSupportContracts from './premium-support-contracts';
import premiumSupportSummary from './premium-support-summary';
import premiumSupportRoute from './routes';

export default module => {
  module.service('premiumSupportPlansService', premiumSupportPlansService);
  module.service('premiumSupportContractsService', premiumSupportContractsService);
  module.directive('longread', longread);
  module.directive('premiumSupportProvision', premiumSupportProvision);
  module.directive('premiumSupportAgreement', premiumSupportAgreement);
  module.directive('premiumSupportPlans', premiumSupportPlans);
  module.component('premiumSupportContracts', premiumSupportContracts);
  module.directive('premiumSupportSummary', premiumSupportSummary);
  module.config(premiumSupportRoute);
};
