import template from './openstack-instance-security-groups.html';

export default function openstackInstanceSecurityGroups() {
  return {
    restrict: 'E',
    template: template,
    controller: SecurityGroupController,
    controllerAs: '$ctrl',
    bindToController: true,
    scope: {
      securityGroups: '='
    }
  };
}

class SecurityGroupController {
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
      component: 'securityGroupDetails',
      resolve: {
        securityGroups: () => this.securityGroups
      }
    });
  }
}
