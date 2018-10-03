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
      this.chosenItem = this.options.choices[0];
      this.$scope.$watch(() => this.chosenItem, () => {
        if (this.chosenItem) {
          this.options.value = this.chosenItem.value;
        }
        this.onSelect();
      }, true);
    }
  }
};

export default filterSelector;
