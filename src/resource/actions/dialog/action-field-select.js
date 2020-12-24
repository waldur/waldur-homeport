import { translate } from '@waldur/i18n';

import template from './action-field-select.html';

export default {
  template,
  bindings: {
    model: '<',
    field: '<',
  },
  controller: class {
    getPlaceholder() {
      return translate('Select an option');
    }
  },
};
