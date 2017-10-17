import expertBidsService from './expert-bids-service';
import expertBidsList from './expert-bids-list';
import ExpertBidUtilsService from './expert-bid-utils';
import createModule from './create/module';
import detailsModule from './details/module';

export default module => {
  module.component('expertBidsList', expertBidsList);
  module.service('ExpertBidUtilsService', ExpertBidUtilsService);
  module.service('expertBidsService', expertBidsService);
  createModule(module);
  detailsModule(module);
};
