const labelClasses = {
  'Run Scheduled': 'label-warning',
  Running: 'label-primary',
  Erred: 'label-danger',
  OK: 'label-success',
};

const ansibleJobState = {
  template: `
  <span class="label" ng-class="$ctrl.getLabelClass()">
    {{ $ctrl.model.state | translate | uppercase }}
  </span>`,
  bindings: {
    model: '<',
  },
  controller: class AnsibleJobStateController {
    getLabelClass() {
      if (!this.model) {
        return;
      }
      const { state } = this.model;
      return labelClasses[state] || 'label-info';
    }
  }
};

export default ansibleJobState;
