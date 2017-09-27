import template from './expert-request-create-title.html';

const expertRequestCreateTitle = {
  template,
  bindings: {
    expert: '<',
  },
  controller: class ExpertRequestCreateTitleController {
    $onInit() {
      this.billingTypeVisible = this.expert.hasOwnProperty('recurring_billing');
    }
  }
};

export default expertRequestCreateTitle;
