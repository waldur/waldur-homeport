import template from './security-groups-dialog.html';

// @ngInject
class SecurityGroupsDialogController {
  $onInit() {
    this.securityGroups = this.resolve.securityGroups;
  }
}

const securityGroupsDialog = {
  template,
  controller: SecurityGroupsDialogController,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '='
  }
};

export default securityGroupsDialog;
