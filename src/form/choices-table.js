import template from './choices-table.html';

class TableController {
  // @ngInject
  constructor($filter, $scope) {
    this.$filter = $filter;
    this.$scope = $scope;
  }

  $onInit() {
    if (this.filterOptions) {
      this.$scope.$watch(
        () => this.filterValue,
        filterValue =>
          (this.filter = {
            [this.filterOptions.name]: filterValue,
          }),
      );
    }
    this.style = {
      'max-height': '300px',
      'overflow-y': 'auto',
    };

    if (angular.isUndefined(this.enableSelect)) {
      this.enableSelect = true;
    }
    if (
      this.filterOptions &&
      angular.isDefined(this.filterOptions.defaultValue)
    ) {
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
    },
  };
}
