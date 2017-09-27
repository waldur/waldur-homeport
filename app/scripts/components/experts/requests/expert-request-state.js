import template from './expert-request-state.html';

const labelClasses = {
  Pending: 'progress-bar-warning',
  Active: '',
  Cancelled: 'progress-bar-danger',
  Finished: 'progress-bar-success',
};

const expertRequestState = {
  template,
  bindings: {
    model: '<',
  },
  controller: class {
    getLabelClass() {
      if (!this.model) {
        return;
      }
      const { state } = this.model;
      return labelClasses[state] || 'label-info';
    }
  }
};

export default expertRequestState;
