import expertRequestsService from './expert-requests-service';
import expertRequestsList from './expert-request-list';
import expertRequestsProjectList from './expert-request-project-list';
import expertRequestState from './expert-request-state';
import expertRequestDetails from './expert-request-details';
import expertRequestHeader from './expert-request-header';
import expertRequestSummary from './expert-request-summary';
import expertRequestCreate from './expert-request-create';
import expertRequestCancel from './expert-request-cancel';

export default module => {
  module.service('expertRequestsService', expertRequestsService);
  module.component('expertRequestsList', expertRequestsList);
  module.component('expertRequestsProjectList', expertRequestsProjectList);
  module.component('expertRequestHeader', expertRequestHeader);
  module.component('expertRequestSummary', expertRequestSummary);
  module.component('expertRequestCreate', expertRequestCreate);
  module.component('expertRequestState', expertRequestState);
  module.component('expertRequestDetails', expertRequestDetails);
  module.component('expertRequestCancel', expertRequestCancel);
};
