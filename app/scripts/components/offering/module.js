import offeringsService from './offerings-service';
import projectOfferingsList from './offerings-list';
import appstoreOffering from './appstore-offering';
import offeringHeader from './offering-header';
import offeringSummary from './offering-summary';
import offeringDetails from './offering-details';
import offeringEvents from './offering-events';
import offeringState from './offering-state';

export default module => {
  module.service('offeringsService', offeringsService);
  module.component('projectOfferingsList', projectOfferingsList);
  module.component('offeringHeader', offeringHeader);
  module.component('offeringSummary', offeringSummary);
  module.component('appstoreOffering', appstoreOffering);
  module.component('offeringDetails', offeringDetails);
  module.component('offeringEvents', offeringEvents);
  module.component('offeringState', offeringState);
};
