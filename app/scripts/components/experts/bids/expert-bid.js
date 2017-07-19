import template from './expert-bid.html';

const expertBid = {
  template,
  bindings: {
    bid: '<',
  },
  controller: class ExpertBidDetailsController {
    // @ngInject
    constructor($uibModal) {
      this.$uibModal = $uibModal;
    }

    openUserDetails(user) {
      this.$uibModal.open({
        component: 'userPopover',
        resolve: {
          user_uuid: () => user.uuid
        }
      });
    }
  }
};

export default expertBid;
