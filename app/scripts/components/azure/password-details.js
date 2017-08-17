import template from './password-details.html';

const passwordDetails = {
  template,
  bindings: {
    value: '<',
    label: '<',
  },
  controller: class PasswordDetailsController {
    $onInit() {
      this.label = this.label || gettext('Password');
    }
  }
};

export default passwordDetails;
