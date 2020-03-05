import template from './action-field-json.html';

class ActionFieldJsonController {
  validateJSON() {
    try {
      JSON.parse(this.model[this.field.name]);
      this.form[this.field.name].$setValidity('valid', true);
    } catch (e) {
      this.form[this.field.name].$setValidity('valid', false);
    }
    return true;
  }
}

const actionFieldJson = {
  template: template,
  controller: ActionFieldJsonController,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
};

export default actionFieldJson;
