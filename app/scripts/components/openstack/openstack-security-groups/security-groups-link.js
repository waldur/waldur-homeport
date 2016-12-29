import template from './security-groups-link.html';

export default function securityGroupsLink() {
  return {
    restrict: 'E',
    template: template,
    controller: securityGroupsLinkController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      securityGroups: '='
    }
  };
}

// @ngInject
class securityGroupsLinkController {
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
