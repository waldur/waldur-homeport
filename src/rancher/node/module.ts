import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import nodeActions from './actions';
import './breadcrumbs';
import { RancherNodeSummary } from './RancherNodeSummary';

import './tabs';

export default () => {
  ResourceSummary.register('Rancher.Node', RancherNodeSummary);
  ActionConfigurationRegistry.register('Rancher.Node', nodeActions);
};
