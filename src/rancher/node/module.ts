import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import nodeActions from './actions';
import './breadcrumbs';
import { RancherNodeSummary } from './RancherNodeSummary';

ResourceTabsConfiguration.register('Rancher.Node', () => []);
ResourceSummary.register('Rancher.Node', RancherNodeSummary);
ActionConfigurationRegistry.register('Rancher.Node', nodeActions);
