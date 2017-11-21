import template from './filter-selector.html';

const filterSelector = {
  template: template,
  bindings: {
    options: '<',
    isLoading: '<',
    onSelect: '&'
  },
  controller: class FilterSelectorController {
    // @ngInject
    constructor($scope) {
      this.$scope = $scope;
    }

    $onInit() {
      this.$scope.$watch(() => this.chosenItem, () => {
        if (this.chosenItem) {
          this.options.value = this.chosenItem.value;
        } else {
          this.options.value = undefined;
        }
        this.onSelect();
      }, true);
    }
  }
};

export default filterSelector;
