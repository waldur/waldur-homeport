import template from './security-groups-link.html';

// @ngInject
class SecurityGroupsLinkController {
  // @ngInject
  constructor($uibModal, $scope) {
    this.$uibModal = $uibModal;
    $scope.$watch('$ctrl.securityGroups', ((newGroups) => {
      if (newGroups) {
        this.securityGroupsString = newGroups.map((item) => {
          return item.name;
        }).join(', ');
      }
    }));
  }

  openDetailsDialog() {
    this.$uibModal.open({
      component: 'securityGroupsDialog',
      resolve: {
        securityGroups: () => this.securityGroups
      }
    });
  }
}

const securityGroupsLink = {
  template: template,
  controller: SecurityGroupsLinkController,
  bindings: {
    securityGroups: '<'
  }
};

export default securityGroupsLink;
