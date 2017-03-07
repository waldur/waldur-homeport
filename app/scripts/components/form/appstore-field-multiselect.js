import template from './appstore-field-multiselect.html';

const appstoreFieldMultiselect = {
  template,
  bindings: {
    model: '<',
    field: '<'
  },
  controller: class FieldController {
    $onInit() {
      if (this.field.parser) {
        const choices = this.field.choices.map(this.field.parser);
        this.field = angular.extend({}, this.field, {choices});
      }

      if (this.field.choicesFilter) {
        this.choicesCopy = angular.copy(this.field.choices);
        this.filterChoices();
      }
    }

    filterChoices() {
      if (this.field.choicesFilter) {
        const choices = this.field.choicesFilter(this.choicesCopy, this.model[this.field.name]);
        this.field = angular.extend({}, this.field, {choices});
      }
    }
  }
};

export default appstoreFieldMultiselect;
