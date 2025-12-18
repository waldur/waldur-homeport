import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

import { AZURE_VM_TYPE } from '../constants';

const AzureVirtualMachineSummary = lazyComponent(() =>
  import('./AzureVirtualMachineSummary').then((module) => ({
    default: module.AzureVirtualMachineSummary,
  })),
);

export const AzureVirtualMachineSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: AZURE_VM_TYPE,
    component: AzureVirtualMachineSummary,
  };
