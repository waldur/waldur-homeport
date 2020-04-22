import template from './action-field-timezone.html';
import { getTimezoneItems } from './timezone';

export default {
  template,
  bindings: {
    model: '<',
    field: '<',
  },
  controller: class Controller {
    $onInit() {
      // Set current timezone if value is not defined and i18n API is available
      if (!this.model[this.field.name] && typeof Intl !== 'undefined') {
        this.model[
          this.field.name
        ] = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      this.choices = getTimezoneItems();
    }
  },
};
