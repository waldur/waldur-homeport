import template from './appstore-form-fieldset.html';

const appstoreFormFieldset = {
  template,
  bindings: {
    form: '<',
    model: '=',
    fields: '<',
    errors: '<',
  },
  controller: class AppstoreFormFieldsetController {
    getClass() {
      return 'col-sm-6';
    }

    renderLabel(field) {
      return field.type !== 'boolean' && field.type !== 'label';
    }
  },
};

export default appstoreFormFieldset;
