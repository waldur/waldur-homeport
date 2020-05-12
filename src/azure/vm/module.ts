import './marketplace';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import { AzureVirtualMachineSummary } from './AzureVirtualMachineSummary';

ResourceSummary.register('Azure.VirtualMachine', AzureVirtualMachineSummary);
