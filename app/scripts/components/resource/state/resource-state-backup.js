const labelClasses = {
  Unsupported: 'progress-bar-plain',
  Unset: 'progress-bar-danger',
  Warning: 'progress-bar-warning',
  OK: 'progress-bar-success',
};

const resourceStateBackup = {
  template: `
  <div class="progress state-indicator m-b-none">
    <span
      class="progress-bar p-w-sm full-width"
      uib-tooltip="{{ $ctrl.resource.last_backup }}"
      ng-class="$ctrl.getLabelClass()">
      {{ $ctrl.resource.backup_state | translate | uppercase }}
    </span>
  </div>
  `,
  bindings: {
    resource: '<',
  },
  controller: class ResourceStateBackupController {
    getLabelClass() {
      if (!this.resource) {
        return;
      }
      const { backup_state } = this.resource;
      return labelClasses[backup_state] || 'progress-bar-info';
    }
  }
};

export default resourceStateBackup;
