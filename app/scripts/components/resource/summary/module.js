import resourceSummary from './resource-summary';
import { resourceSummaryBase } from './resource-summary-base';

export default module => {
  module.component('resourceSummary', resourceSummary);
  module.component('resourceSummaryBase', resourceSummaryBase);
};
