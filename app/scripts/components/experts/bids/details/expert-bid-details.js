import { STATE } from '../../requests/constants';
import template from './expert-bid-details.html';

const expertBidDetails = {
  template,
  bindings: {
    expertRequest: '<',
  },
  controller: class ExpertBidDetailsController {
    // @ngInject
    constructor(
      $scope,
      currentStateService,
      customersService,
      expertBidsService,
      ExpertUtilsService,
      ExpertBidUtilsService,
      ncUtilsFlash) {
      this.$scope = $scope;
      this.currentStateService = currentStateService;
      this.customersService = customersService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.expertBidsService = expertBidsService;
      this.ExpertUtilsService = ExpertUtilsService;
      this.ExpertBidUtilsService = ExpertBidUtilsService;
    }

    $onInit() {
      this.fetchExpertBid();
      this.$scope.$on('refreshBidsList', () => this.fetchExpertBid());
      this.$scope.$on('reloadExpertRequest', () => this.fetchExpertBid());
    }

    fetchExpertBid() {
      this.loading = true;
      this.expertBid = null;
      return this.customersService.isOwnerOrStaff().then(canManageRequest => {
        this.canManageRequest = canManageRequest;
        return this.currentStateService.getCustomer().then(customer => {
          return this.expertBidsService.getAll({
            request_uuid: this.expertRequest.uuid,
            customer_uuid: customer.uuid,
          }).then(bids => {
            if (bids.length === 1) {
              this.expertBid = bids[0];
            }
          }).catch(response => {
            this.ncUtilsFlash.errorFromResponse(response, gettext('Proposal could not be fetched.'));
          }).finally(() => {
            this.loading = false;
          });
        });
      });
    }

    canManage() {
      return this.canManageRequest && this.expertRequest.state === STATE.PENDING;
    }

    createBid() {
      this.ExpertUtilsService.createBid(this.expertRequest);
    }

    delete() {
      this.deleting = true;
      this.ExpertBidUtilsService.deleteBid(this.expertBid.url).finally(() => {
        this.deleting = false;
        this.close();
      });
    }
  }
};

export default expertBidDetails;
