import template from './appstore-field-file.html';

const appstoreFieldFile = {
  template,
  bindings: {
    field: '<',
    model: '=',
    form: '=',
  },
  controller: class AppstoreFieldFileController {
    // @ngInject
    constructor(coreUtils, formUtils) {
      this.coreUtils = coreUtils;
      this.formUtils = formUtils;
    }

    $onInit() {
      const fileInput = document.getElementById('fileField');
      fileInput.addEventListener('change', () => {
        this.model[this.field.name] = fileInput.files[0];
      });
    }

    invalid() {
      return this.formUtils.formFieldInvalid(this.form, this.field.name);
    }

    showRequiredError() {
      return this.invalid() && this.form[this.field.name].$error.required;
    }

    showFileError() {
      return this.invalid() && this.form[this.field.name].$error.file;
    }
  },
};

export default appstoreFieldFile;
