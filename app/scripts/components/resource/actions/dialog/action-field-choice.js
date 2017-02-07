import template from './action-field-choice.html';

export default {
  template,
  bindings: {
    model: '<',
    field: '<'
  },
  controller: class ActionFieldChoiceController {
    $onInit() {
      this.choicesCopy = angular.copy(this.field.choices);
    }
  }
};
