import actions from './actions';
import offeringReportDialog from './OfferingReportDialog';
import offeringRoutes from './routes';
import './events';
import './marketplace';

// @ngInject
function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('Support.Offering', actions);
}

export default module => {
  module.config(offeringRoutes);
  module.component('offeringReportDialog', offeringReportDialog);
  module.config(actionsConfig);
};
