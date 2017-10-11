import template from './expert-request-cancel.html';
import { STATE } from '../constants';

const expertRequestCancel = {
  template,
  bindings: {
    expertRequest: '<'
  },
  controller: class ExpertRequestCancelController {
    // @ngInject
    constructor($rootScope, expertRequestsService, customersService, ncUtilsFlash) {
      this.$rootScope = $rootScope;
      this.expertRequestsService = expertRequestsService;
      this.customersService = customersService;
      this.ncUtilsFlash = ncUtilsFlash;
    }

    $onInit() {
      this.customersService.isOwnerOrStaff()
        .then(canManageRequest => this.canManageRequest = canManageRequest);
    }

    isVisible() {
      const state = this.expertRequest.state;
      return this.canManageRequest && (state === STATE.ACTIVE || state === STATE.PENDING);
    }

    submit() {
      return this.expertRequestsService.cancel(this.expertRequest).then(() => {
        this.ncUtilsFlash.success(gettext('Expert request has been cancelled.'));
        this.$rootScope.$broadcast('refreshExpertDetails');
      }).catch(response => {
        this.ncUtilsFlash.errorFromResponse(response, gettext('Unable to cancel expert request.'));
      });
    }
  }
};

export default expertRequestCancel;
