import { ActionRegistry } from '@waldur/resource/actions/registry';

import clusterActions from './actions';
import './create/marketplace';
import './tabs';

ActionRegistry.register('Rancher.Cluster', clusterActions);
