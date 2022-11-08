import './marketplace';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';

const AzureVirtualMachineSummary = lazyComponent(
  () => import('./AzureVirtualMachineSummary'),
  'AzureVirtualMachineSummary',
);

ResourceSummary.register('Azure.VirtualMachine', AzureVirtualMachineSummary);
ActionRegistry.register('Azure.VirtualMachine', actions);
