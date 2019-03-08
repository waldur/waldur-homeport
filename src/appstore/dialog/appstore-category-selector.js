import { translate } from '@waldur/i18n';

import template from './appstore-category-selector.html';
import './appstore-category-selector.scss';

const appstoreCategorySelector = {
  template,
  bindings: {
    groups: '<',
    currentGroup: '<',
    onSelect: '&',
  },
  controller: class {
    getPriceTooltip(category) {
      return category.price_tooltip || translate('Price per month (VAT not included)');
    }
  }
};

export default appstoreCategorySelector;
