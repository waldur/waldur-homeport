import offeringRoutes from './routes';
import offeringsService from './offerings-service';
import offeringSummary from './OfferingSummary';
import offeringDetails from './offering-details';
import offeringState from './OfferingState';
import offeringReportButton from './OfferingReportButton';
import offeringReportDialog from './OfferingReportDialog';
import actions from './actions';
import './events';
import './marketplace';

export default module => {
  module.config(offeringRoutes);
  module.service('offeringsService', offeringsService);
  module.component('offeringSummary', offeringSummary);
  module.component('offeringDetails', offeringDetails);
  module.component('offeringState', offeringState);
  module.component('offeringReportButton', offeringReportButton);
  module.component('offeringReportDialog', offeringReportDialog);
  module.config(actionsConfig);
};

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('Support.Offering', actions);
}
