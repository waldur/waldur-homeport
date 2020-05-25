import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';

import actions from './actions';
import offeringRoutes from './routes';
import './events';
import './marketplace';

export default module => {
  module.config(offeringRoutes);
  ActionConfigurationRegistry.register('Support.Offering', actions);
};
