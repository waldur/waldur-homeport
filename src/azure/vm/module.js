import './marketplace';
import { AzureVirtualMachineSummary } from './AzureVirtualMachineSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default () => {
  ResourceSummary.register('Azure.VirtualMachine', AzureVirtualMachineSummary);
};
