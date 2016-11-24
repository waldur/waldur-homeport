import { premiumSupportPlansService, premiumSupportContractsService } from './premium-support-service';
import longread from './longread';
import appstoreSupportAgreement from './appstore-support-agreement';
import supportAgreementsList from './support-agreements-list';
import supportAgreementSummary from './support-agreement-summary';

export default module => {
  module.service('premiumSupportPlansService', premiumSupportPlansService);
  module.service('premiumSupportContractsService', premiumSupportContractsService);
  module.directive('longread', longread);
  module.directive('appstoreSupportAgreement', appstoreSupportAgreement);
  module.directive('supportAgreementsList', supportAgreementsList);
  module.directive('supportAgreementSummary', supportAgreementSummary);
}
