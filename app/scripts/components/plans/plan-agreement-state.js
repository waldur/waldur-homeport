import template from './plan-agreement-state.html';

const planAgreementState = {
  template: template,
  bindings: {
    agreement: '<'
  },
  controller: function PlanAgreementStateController($scope) {
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
};

export default planAgreementState;
