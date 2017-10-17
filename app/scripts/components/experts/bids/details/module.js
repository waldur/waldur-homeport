import expertBidDetails from './expert-bid-details';
import expertBidDialog from './expert-bid-dialog';
import expertBidSummary from './expert-bid-summary';

export default module => {
  module.component('expertBidDetails', expertBidDetails);
  module.component('expertBidDialog', expertBidDialog);
  module.component('expertBidSummary', expertBidSummary);
};
