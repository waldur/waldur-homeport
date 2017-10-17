import template from './expert-bid-dialog.html';
import { STATE } from '../../requests/constants';

const expertBidDialog = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  },
  controller: class ExpertBidDialogController {
    // @ngInject
    constructor($uibModal, $rootScope, ExpertBidUtilsService, customersService) {
      this.$uibModal = $uibModal;
      this.$rootScope = $rootScope;
      this.ExpertBidUtilsService = ExpertBidUtilsService;
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
      this.ExpertBidUtilsService.acceptBid(this.bid.url).finally(() => {
        this.loading = false;
        this.close();
      });
    }
  }
};

export default expertBidDialog;
