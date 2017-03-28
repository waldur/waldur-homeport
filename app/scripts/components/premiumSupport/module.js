import { premiumSupportPlansService, premiumSupportContractsService} from './premium-support-service';
import longread from './longread';
import premiumSupportProvision from './premium-support-provision';
import premiumSupportAgreement from './premium-support-agreement';
import premiumSupportPlans from './premium-support-plans';
import premiumSupportSummary from './premium-support-summary';
import premiumSupportRoute from './routes';
import premiumSupportContractsModule from './premium-support-contracts/module';

export default module => {
  module.service('premiumSupportPlansService', premiumSupportPlansService);
  module.service('premiumSupportContractsService', premiumSupportContractsService);
  premiumSupportContractsModule(module);
  module.directive('longread', longread);
  module.directive('premiumSupportProvision', premiumSupportProvision);
  module.directive('premiumSupportAgreement', premiumSupportAgreement);
  module.directive('premiumSupportPlans', premiumSupportPlans);
  module.directive('premiumSupportSummary', premiumSupportSummary);
  module.config(premiumSupportRoute);
};
