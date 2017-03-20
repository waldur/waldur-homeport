import template from './cost-plan-dialog.html';

const costPlanDialog = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  },
  controller: class CostPlanDialogController {
    constructor() {
      // @ngInject
    }
  }
};

export default costPlanDialog;
