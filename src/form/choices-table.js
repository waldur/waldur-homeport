import template from './choices-table.html';

export default function choicesTable() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    controller: TableController,
    controllerAs: '$ctrl',
    bindToController: {
      choices: '=',
      columns: '=',
      value: '=',
      filterOptions: '=',
      selectItem: '&',
      enableSelect: '<',
    }
  };
}

class TableController {
  // @ngInject
  constructor($filter, $scope) {
    this.$filter = $filter;
    if (this.filterOptions) {
      $scope.$watch(
        () => this.filterValue,
        filterValue => this.filter = {
          [this.filterOptions.name]: filterValue
        }
      );
    }
    this.style = {
      'max-height': '300px',
      'overflow-y': 'auto'
    };
  }

  $onInit() {
    if (angular.isUndefined(this.enableSelect)) {
      this.enableSelect = true;
    }
    if (this.filterOptions && angular.isDefined(this.filterOptions.defaultValue)) {
      this.filterValue = this.filterOptions.defaultValue;
    }
  }

  formatValue(column, choice) {
    const value = choice[column.name];
    if (!column.filter) {
      return value;
    }
    return this.$filter(column.filter)(value);
  }
}
