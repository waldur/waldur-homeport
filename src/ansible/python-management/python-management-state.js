const LABEL_CLASSES = {
  Scheduled: 'progress-bar-striped active',
  Executing: 'progress-bar-striped active',
  Erred: 'progress-bar-danger',
  OK: ' '
};

const STATE_READABLE_TEXT_MAPPING = {
  OK: 'OK',
  Erred: 'Erred',
  'Creation Scheduled': 'Execution Scheduled',
  Creating: 'Executing',
};

const pythonManagementState = {
  template: `
    <div class="progress state-indicator m-b-none">
      <span class="progress-bar p-w-sm full-width" ng-class="$ctrl.getLabelClass($ctrl.model.state)">
        {{ $ctrl.getStateText($ctrl.model.state) | translate | uppercase }}
      </span>
    </div>
  `,
  bindings: {
    model: '<',
  },
  controller: class PythonManagementStateController {
    getStateText(rawStateText) {
      return STATE_READABLE_TEXT_MAPPING[rawStateText];
    }

    getLabelClass(requestState) {
      return LABEL_CLASSES[requestState] || 'progress-bar-info';
    }
  }
};
export default pythonManagementState;
