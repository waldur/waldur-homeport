import template from './expert-request-cancel.html';

const expertRequestCancel = {
  template,
  bindings: {
    expertRequest: '<'
  },
  controller: class ExpertRequestCancelController {
    // @ngInject
    constructor(expertRequestsService, customersService, ncUtilsFlash, $rootScope) {
      this.expertRequestsService = expertRequestsService;
      this.customersService = customersService;
      this.ncUtilsFlash = ncUtilsFlash;
      this.$rootScope = $rootScope;
    }

    $onInit() {
      this.customersService.isOwnerOrStaff()
        .then(canManageRequest => this.canManageRequest = canManageRequest);
    }

    canCancelRequest() {
      return this.canManageRequest && this.expertRequest.state === 'Active';
    }

    cancelRequest() {
      return this.expertRequestsService.cancel(this.expertRequest).then(() => {
        this.ncUtilsFlash.success(gettext('Expert request has been cancelled.'));
        this.$rootScope.$broadcast('refreshExpertDetails');
      }).catch(() => {
        this.ncUtilsFlash.error(gettext('Unable to cancel expert request.'));
      });
    }
  }
};

export default expertRequestCancel;
