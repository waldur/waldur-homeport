import resourceSummary from './resource-summary';
import { resourceSummaryBase } from './resource-summary-base';
import virtualMachineSummary from './virtual-machine-summary';

export default module => {
  module.component('resourceSummary', resourceSummary);
  module.component('resourceSummaryBase', resourceSummaryBase);
  module.component('virtualMachineSummary', virtualMachineSummary);
};
