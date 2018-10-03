import resourceSummary from './ResourceSummary';
import resourceSummaryModal from './ResourceSummaryModal';
import resourceSummaryButton from './ResourceSummaryButton';

export default module => {
  module.component('resourceSummary', resourceSummary);
  module.component('resourceSummaryModal', resourceSummaryModal);
  module.component('resourceSummaryButton', resourceSummaryButton);
};
