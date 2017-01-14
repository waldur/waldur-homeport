import template from './security-groups-dialog.html';

export default function securityGroupsDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: securityGroupsDialogController,
    controllerAs: '$ctrl',
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&',
      resolve: '='
    }
  };
}

// @ngInject
class securityGroupsDialogController {
  constructor($filter) {
    this.securityGroups = this.resolve.securityGroups;
    this.$filter = $filter;
  }
}
