import expertRequestsService from './expert-requests-service';
import expertRequestsList from './expert-request-list';
import expertRequestState from './expert-request-state';
import expertRequestDetails from './expert-request-details';
import expertRequestHeader from './expert-request-header';
import expertRequestSummary from './expert-request-summary';
import expertRequestTabs from './expert-request-tabs';
import expertRequestCreate from './expert-request-create';
import registerExpertRequestCategory from './register-expert-request-category';

export default module => {
  module.service('expertRequestsService', expertRequestsService);
  module.component('expertRequestsList', expertRequestsList);
  module.component('expertRequestTabs', expertRequestTabs);
  module.component('expertRequestHeader', expertRequestHeader);
  module.component('expertRequestSummary', expertRequestSummary);
  module.component('expertRequestCreate', expertRequestCreate);
  module.component('expertRequestState', expertRequestState);
  module.component('expertRequestDetails', expertRequestDetails);
  module.run(registerExpertRequestCategory);
};
