import './marketplace';
import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

const AzureVirtualMachineSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AzureVirtualMachineSummary" */ './AzureVirtualMachineSummary'
    ),
  'AzureVirtualMachineSummary',
);

ResourceSummary.register('Azure.VirtualMachine', AzureVirtualMachineSummary);
