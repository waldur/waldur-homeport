import template from './plan-agreement-state.html';

// @ngInject
function PlanAgreementStateController($scope) {
  this.className = 'progress-bar-primary';

  $scope.$watch(() => this.agreement, () => {
    if (this.agreement) {
      this.state = this.agreement.state;
      if (this.state !== 'active') {
        this.className = 'progress-bar-plain';
      }
    }
  });
}

const planAgreementState = {
  template: template,
  bindings: {
    agreement: '<'
  },
  controller: PlanAgreementStateController
};

export default planAgreementState;
