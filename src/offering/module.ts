import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';

import actions from './actions';
import offeringReportDialog from './OfferingReportDialog';
import offeringRoutes from './routes';
import './events';
import './marketplace';

export default module => {
  module.config(offeringRoutes);
  module.component('offeringReportDialog', offeringReportDialog);
  ActionConfigurationRegistry.register('Support.Offering', actions);
};
