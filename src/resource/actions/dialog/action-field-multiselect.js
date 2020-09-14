import template from './action-field-multiselect.html';

const actionFieldMultiselect = {
  template,
  bindings: {
    model: '<',
    field: '<',
  },
  controller: class FieldController {
    $onInit() {
      if (this.field.parser) {
        const choices = this.field.choices.map(this.field.parser);
        this.field = { ...this.field, choices };
      }

      if (this.field.default) {
        const defaultValue = this.field.choices.filter((item) => {
          return item.object.name === this.field.default;
        })[0];
        if (defaultValue) {
          this.model[this.field.name] = [];
          this.model[this.field.name].push(defaultValue);
        }
      }
    }
    isLocked(item) {
      return this.field.default && item.display_name === this.field.default;
    }
  },
};

export default actionFieldMultiselect;
