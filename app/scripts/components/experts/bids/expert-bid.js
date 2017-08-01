import template from './expert-bid.html';

const expertBid = {
  template,
  bindings: {
    bid: '<',
  },
  controller: class ExpertBidDetailsController {
    // @ngInject
    constructor($uibModal, expertBidsService, $rootScope, ncUtilsFlash, customersService) {
      this.$uibModal = $uibModal;
      this.expertBidsService = expertBidsService;
      this.$rootScope = $rootScope;
      this.ncUtilsFlash = ncUtilsFlash;
      this.customersService = customersService;
    }

    $onInit() {
      this.customersService.isOwnerOrStaff()
        .then(canManageRequest => this.canManageRequest = canManageRequest);
    }

    openUserDetails(user) {
      this.$uibModal.open({
        component: 'userPopover',
        resolve: {
          user_uuid: () => user.uuid
        }
      });
    }

    accept() {
      this.expertBidsService.accept(this.bid.url).then(() => {
        this.ncUtilsFlash.success(gettext('Expert bid has been accepted.'));
        this.$rootScope.$broadcast('refreshExpertDetails');
      }).catch(response => {
        let aggregatedError = response.data.join();
        this.ncUtilsFlash.error(gettext('Expert bid could not be accepted.') + ` Reason: ${aggregatedError}`);
      });
    }
  }
};

export default expertBid;
