import template from './category-selector-tabs.html';

const categorySelectorTabs = {
  template,
  bindings: {
    groups: '<',
    onSelect: '&',
  },
};

export default categorySelectorTabs;
