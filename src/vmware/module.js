import './marketplace';
import './provider';
import { VMwareVirtualMachineSummary } from './VMwareVirtualMachineSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default () => {
  ResourceSummary.register('VMware.VirtualMachine', VMwareVirtualMachineSummary);
};
