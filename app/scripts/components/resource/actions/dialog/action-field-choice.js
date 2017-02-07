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

    refreshChoice(search) {
      this.field.choices =  this.choicesCopy.filter(function(region) {
        return region.display_name.toLowerCase().indexOf(search.toLowerCase()) !== -1;
      });
    }
  }
};
