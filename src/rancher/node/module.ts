import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import nodeActions from './actions';
import './breadcrumbs';

const RancherNodeSummary = lazyComponent(
  () =>
    import(/* webpackChunkName: "RancherNodeSummary" */ './RancherNodeSummary'),
  'RancherNodeSummary',
);

ResourceTabsConfiguration.register('Rancher.Node', () => []);
ResourceSummary.register('Rancher.Node', RancherNodeSummary);
ActionConfigurationRegistry.register('Rancher.Node', nodeActions);
