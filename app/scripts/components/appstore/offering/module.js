import offeringsService from './offerings-service';
import projectOfferingsList from './offerings-list';
import appstoreOffering from './appstore-offering';
import offeringDetails from './offering-details';

export default module => {
  module.service('offeringsService', offeringsService);
  module.component('projectOfferingsList', projectOfferingsList);
  module.component('appstoreOffering', appstoreOffering);
  module.component('offeringDetails', offeringDetails);
};
