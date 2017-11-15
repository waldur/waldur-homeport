class ProjectValidationService {
  // @ngInject
  constructor($q) {
    this.$q = $q;
  }

  validate(options) {
    let projects = options.projects;
    let isValid = true;
    let form = options.form;
    let name = form.name;
    let errors = {
      name: [],
      description: [],
      nonFieldErrors: []
    };

    if (!this.validateName(name, projects, errors.name)) {
      isValid = false;
    }

    return isValid ? true: errors;
  }

  validateName(nameController, projects, errors) {
    let isUnique = true;
    let isFilled = true;
    if (!nameController.$viewValue) {
      isFilled = false;
      errors.push(gettext('Fill up the name.'));
    } else {
      for (let i = 0; i < projects.length; i++) {
        if (projects[i].name === nameController.$viewValue) {
          isUnique = false;
          errors.push(gettext('Name is duplicated. Choose other name.'));
        }
      }
    }
    nameController.$setValidity('filled', isFilled);
    nameController.$setValidity('unique', isUnique);
    return isUnique && isFilled;
  }
}

export default ProjectValidationService;
