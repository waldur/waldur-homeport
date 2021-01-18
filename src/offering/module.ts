import { ActionRegistry } from '@waldur/resource/actions/registry';

import { OfferingActions } from './actions/OfferingActions';

import './events';
import './marketplace';

ActionRegistry.register('Support.Offering', OfferingActions);
