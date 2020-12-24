import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';

import actions from './actions';
import './events';
import './marketplace';

ActionConfigurationRegistry.register('Support.Offering', actions);
