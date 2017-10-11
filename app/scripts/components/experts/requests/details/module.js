import expertRequestDetails from './expert-request-details';
import expertRequestDetailsDialog from './expert-request-details-dialog';
import expertRequestGeneralInfo from './expert-request-general-info';
import expertRequestSection from './expert-request-section';
import expertRequestSummary from './expert-request-summary';

export default module => {
  module.component('expertRequestDetails', expertRequestDetails);
  module.component('expertRequestDetailsDialog', expertRequestDetailsDialog);
  module.component('expertRequestGeneralInfo', expertRequestGeneralInfo);
  module.component('expertRequestSection', expertRequestSection);
  module.component('expertRequestSummary', expertRequestSummary);
};
