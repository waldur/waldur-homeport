import expertBidsService from './expert-bids-service';
import expertBid from './expert-bid';
import expertBidsList from './expert-bids-list';
import expertBidCreateDialog from './expert-bid-create-dialog';

export default module => {
  module.component('expertBidsList', expertBidsList);
  module.component('expertBid', expertBid);
  module.component('expertBidCreateDialog', expertBidCreateDialog);
  module.service('expertBidsService', expertBidsService);
};
