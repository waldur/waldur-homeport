const labelClasses = {
  Scheduled: 'progress-bar-striped active',
  Executing: 'progress-bar-striped active',
  Erred: 'progress-bar-danger',
  OK: ' ',
};

const ansibleJobState = {
  template: `
  <div class="progress state-indicator m-b-none">
    <span class="progress-bar p-w-sm full-width" ng-class="$ctrl.getLabelClass()">
      {{ $ctrl.model.state | translate | uppercase }}
    </span>
  </div>
  `,
  bindings: {
    model: '<',
  },
  controller: class AnsibleJobStateController {
    getLabelClass() {
      if (!this.model) {
        return;
      }
      const { state } = this.model;
      return labelClasses[state] || 'progress-bar-info';
    }
  }
};

export default ansibleJobState;
