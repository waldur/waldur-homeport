import template from './filter-list.html';

const filterList = {
  template: template,
  bindings: {
    searchFilters: '<',
    isLoading: '<',
    onSelect: '&'
  },
  controller: class FilterListController {
    // @ngInject
    constructor($scope) {
      this.$scope = $scope;
    }

    $onInit() {
      this.$scope.$watch(() => this.searchFilters, () => {
        this.onSelect();
      }, true);
    }
  }
};

export default filterList;
