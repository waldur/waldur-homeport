import template from './customer-team.html';

const customerTeam = {
  template: template,
  controller: class CustomerTeamController {
    // @ngInject
    constructor($scope) {
      this.$scope = $scope;
    }

    $onInit() {
      this.$scope.$emit('customerTeam.initialized');
      this.$scope.$on('customerTeam.selectInvitationTab', this.selectInvitationTab.bind(this));
    }

    usersTabSelected() {
      this.$scope.$emit('customerTeam.userTabSelected');
    }

    selectInvitationTab() {
      this.$scope.active = 1;
      this.$scope.$digest();
    }
  }
};

export default customerTeam;
