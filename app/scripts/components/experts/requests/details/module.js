import expertRequestDetails from './expert-request-details';
import expertRequestDetailsDialog from './expert-request-details-dialog';
import expertRequestGeneralInfo from './ExpertRequestGeneralInfo';
import expertRequestSection from './expert-request-section';
import expertRequestSummary from './expert-request-summary';
import expertContractDetails from './ExpertContractDetails';

export default module => {
  module.component('expertContractDetails', expertContractDetails);
  module.component('expertRequestDetails', expertRequestDetails);
  module.component('expertRequestDetailsDialog', expertRequestDetailsDialog);
  module.component('expertRequestGeneralInfo', expertRequestGeneralInfo);
  module.component('expertRequestSection', expertRequestSection);
  module.component('expertRequestSummary', expertRequestSummary);
};
