// @ngInject
export default class ExpertBidUtilsService {
  constructor($rootScope, expertBidsService, ncUtilsFlash) {
    this.$rootScope = $rootScope;
    this.expertBidsService = expertBidsService;
    this.ncUtilsFlash = ncUtilsFlash;
  }

  acceptBid(bid_url) {
    return this.expertBidsService.accept(bid_url).then(() => {
      this.expertBidsService.clearAllCacheForCurrentEndpoint();
      this.$rootScope.$broadcast('reloadExpertRequest');
    }).catch(response => {
      this.ncUtilsFlash.errorFromResponse(response, gettext('Expert bid could not be accepted.'));
    });
  }
}
