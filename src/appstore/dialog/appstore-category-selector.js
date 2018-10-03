import template from './appstore-category-selector.html';
import './appstore-category-selector.scss';

const appstoreCategorySelector = {
  template,
  bindings: {
    groups: '<',
    currentGroup: '<',
    onSelect: '&',
  },
};

export default appstoreCategorySelector;
