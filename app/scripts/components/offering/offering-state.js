import template from './offering-state.html';

const offeringState = {
  template,
  bindings: {
    offering: '<'
  },
  controller: class {
    getLabelClass() {
      const { state } = this.offering;
      return {
        'label-success': state === 'OK',
        'label-warning': state === 'Requested',
        'label-danger': state === 'Terminated',
      };
    }
  }
};

export default offeringState;
