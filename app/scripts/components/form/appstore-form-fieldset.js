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
    getClass(field) {
      if (field.type === 'summernote') {
        return 'col-sm-9';
      } else {
        return 'col-sm-6';
      }
    }

    renderLabel(field) {
      return field.type !== 'boolean' && field.type !== 'label';
    }
  }
};

export default appstoreFormFieldset;
