import template from './appstore-form-wizard.html';

const appstoreFormWizard = {
  template,
  bindings: {
    submit: '&',
    cancel: '&',
    steps: '<',
    model: '=',
  },
  controller: class appstoreFormWizardController {
    $onInit() {
      this.steps[this.steps.length - 1].last = true;
      this.currentStep = 0;
    }

    hasNext() {
      return this.currentStep < this.steps.length - 1;
    }

    currentStepComplete() {
      return this.hasNext() && this.currentFormFilled();
    }

    currentFormFilled() {
      let currentForm = this.currentForm();
      return currentForm && currentForm.$valid && currentForm.$dirty;
    }

    setFormDirty() {
      let form = this.currentForm();
      // required to display validation error messages
      angular.forEach(form.$error.required, function(field) {
        field.$setDirty();
      });
      form.$setDirty();
    }

    next() {
      this.setFormDirty();
      if (this.currentStepComplete()) {
        this.currentStep++;
      }
    }

    currentForm() {
      return this['form' + this.currentStep];
    }

    getCurrentStepClass(index) {
      let selected = this.selected(index);
      return {
        first: index === 0,
        current: selected,
        disabled: !selected,
      };
    }

    hasPrevious() {
      return this.currentStep > 0;
    }

    previous() {
      if (this.hasPrevious()) {
        this.currentStep--;
      }
    }

    selected(index) {
      return this.currentStep === index;
    }

    save() {
      this.setFormDirty();
      if (this.currentFormFilled()) {
        return this.submit();
      }
    }

    getErredFields() {
      let result = [];
      for (let erredFieldName in this.model.errors) {
        for (let stepIndex = 0; stepIndex < this.steps.length; stepIndex++) {
          let step = this.steps[stepIndex];
          for (
            let fieldIndex = 0;
            fieldIndex < step.fields.length;
            fieldIndex++
          ) {
            let currentField = step.fields[fieldIndex];
            if (currentField.name === erredFieldName) {
              result.push(currentField.label);
            }
          }
        }
      }

      return result.join(', ');
    }
  },
};

export default appstoreFormWizard;
