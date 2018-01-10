import offeringsService from './offerings-service';
import projectOfferingsList from './offerings-list';
import appstoreOffering from './appstore-offering';
import offeringSummary from './offering-summary';
import offeringDetails from './offering-details';
import offeringEvents from './offering-events';
import offeringState from './offering-state';
import registerOfferingCategory from './register-offering-category';
import registerSidebarExtension from './sidebar';
import appstoreOfferingSummary from './appstore-offering-summary';
import registerTableExtension from './table-extension';

export default module => {
  module.service('offeringsService', offeringsService);
  module.component('appstoreOfferingSummary', appstoreOfferingSummary);
  module.component('projectOfferingsList', projectOfferingsList);
  module.component('offeringSummary', offeringSummary);
  module.component('appstoreOffering', appstoreOffering);
  module.component('offeringDetails', offeringDetails);
  module.component('offeringEvents', offeringEvents);
  module.component('offeringState', offeringState);
  module.run(registerOfferingCategory);
  module.run(registerSidebarExtension);
  module.run(registerTableExtension);
};
