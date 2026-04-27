import { lazyComponent } from '@/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@/resource/summary/types';

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
