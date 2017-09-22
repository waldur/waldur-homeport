import template from './expert-bid.html';
import { STATE } from './../requests/constants';

const expertBid = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  },
  controller: class ExpertBidDetailsController {
    // @ngInject
    constructor($uibModal, expertBidsService, ncUtilsFlash, customersService) {
      this.$uibModal = $uibModal;
      this.expertBidsService = expertBidsService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.customersService = customersService;
    }

    $onInit() {
      this.loading = false;
      this.bid = this.resolve.bid;
      this.expertRequest = this.resolve.expertRequest;
      this.customersService.isOwnerOrStaff()
        .then(canManageRequest => this.canManageRequest = canManageRequest);
    }

    canAccept() {
      return this.canManageRequest && this.expertRequest.state === STATE.PENDING;
    }

    accept() {
      this.loading = true;
      this.expertBidsService.accept(this.bid.url).then(() => {
        this.expertBidsService.clearAllCacheForCurrentEndpoint();
        this.ncUtilsFlash.success(gettext('Expert bid has been accepted.'));
      }).catch(response => {
        let aggregatedError = response.data.join();
        this.ncUtilsFlash.error(gettext('Expert bid could not be accepted.') + ` Reason: ${aggregatedError}`);
      }).finally(() => {
        this.loading = false;
        this.close();
      });
    }
  }
};

export default expertBid;
