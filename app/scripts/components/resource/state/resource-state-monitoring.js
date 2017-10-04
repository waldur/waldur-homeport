const labelClasses = {
  Unregistered: 'progress-bar-plain',
  Erred: 'progress-bar-danger',
  Warning: 'progress-bar-warning',
  OK: ' ',
};

const resourceStateMonitoring = {
  template: `
  <div class="progress state-indicator m-b-none">
    <span class="progress-bar p-w-sm full-width" ng-class="$ctrl.getLabelClass()">
      {{ $ctrl.resource.monitoring_state | translate | uppercase }}
    </span>
  </div>
  `,
  bindings: {
    resource: '<',
  },
  controller: class ResourceStateMonitoringController {
    getLabelClass() {
      if (!this.resource) {
        return;
      }
      const { monitoring_state } = this.resource;
      return labelClasses[monitoring_state] || 'progress-bar-info';
    }
  }
};

export default resourceStateMonitoring;
