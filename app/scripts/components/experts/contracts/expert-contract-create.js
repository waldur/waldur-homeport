import template from './expert-contract-create.html';

const expertContractCreate = {
  template,
  bindings: {
    contractTemplate: '<',
    expert: '<',
    model: '=',
    errors: '<',
    cancel: '&',
    save: '&',
  },
  controller: class ExpertContractCreateController {
    // @ngInject
    constructor(ncUtilsFlash) {
      this.ncUtilsFlash = ncUtilsFlash;
    }

    $onInit() {
      this.loading = false;
    }

    setFormDirty() {
      let form = this.mainForm;

      // required to display validation error messages
      angular.forEach(form.$error.required, function(field) {
        field.$setDirty();
      });

      form.$setDirty();
    }

    createButtonDisabled() {
      return !this.mainForm || this.mainForm.$invalid || this.loading;
    }

    submit() {
      this.setFormDirty();
      if (this.mainForm.$valid) {
        this.loading = true;
        this.save().finally(() => {
          this.loading = false;
        });
      } else {
        this.ncUtilsFlash.error(gettext('Form has not been filled correctly. Please check your input.'));
      }
    }
  }
};

export default expertContractCreate;
