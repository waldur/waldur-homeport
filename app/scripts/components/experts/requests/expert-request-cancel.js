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
      const state = this.expertRequest.state;
      return this.canManageRequest && (state === 'Active' || state === 'Pending');
    }

    cancelRequest() {
      return this.expertRequestsService.cancel(this.expertRequest).then(() => {
        this.ncUtilsFlash.success(gettext('Expert request has been cancelled.'));
        this.$rootScope.$broadcast('refreshExpertDetails');
      }).catch(response => {
        const details = `Errors: ${JSON.stringify(response.data)}`;
        const message = gettext('Unable to cancel expert request.') + details;
        this.ncUtilsFlash.error(message);
      });
    }
  }
};

export default expertRequestCancel;
