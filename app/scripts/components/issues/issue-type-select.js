import template from './issue-type-select.html';
import { ISSUE_TYPE_CHOICES } from './constants';

const issueTypeSelect = {
  template,
  bindings: {
    model: '<',
    field: '<',
  },
  controller: function() {
    this.types = ISSUE_TYPE_CHOICES;
  }
};

export default issueTypeSelect;
