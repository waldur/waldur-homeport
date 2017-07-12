import template from './expert-request-state.html';

const labelClasses = {
  Pending: 'label-warning',
  Active: 'label-primary',
  Cancelled: 'label-danger',
  Finished: 'label-success',
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
