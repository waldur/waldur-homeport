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
      selectItem: '&'
    }
  }
}

// @ngInject
class TableController {
  constructor($filter) {
    this.$filter = $filter;
  }

  formatValue(column, choice) {
    const value = choice[column.name];
    if (!column.filter) {
      return value;
    }
    return this.$filter(column.filter)(value);
  }
}
