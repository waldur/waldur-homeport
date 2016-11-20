import template from './appstore-list-dialog.html';

export default function appstoreListDialog() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&',
      resolve: '='
    },
    controller: DialogController,
    controllerAs: '$ctrl',
  }
}

// @ngInject
class DialogController {
  constructor($filter) {
    this.$filter = $filter;
    this.field = this.resolve.field;
    this.model = this.resolve.model;
    this.value = this.model[this.field.name];
    this.title = this.field.dialogTitle || `Select ${this.field.label}`;
    this.choices = this.field.choices;
    this.component = this.field.listComponent;
    this.columns = this.field.columns;
  }

  formatValue(column, choice) {
    const value = choice.item[column.name];
    if (!column.filter) {
      return value;
    }
    return this.$filter(column.filter)(value);
  }

  selectItem(item) {
    this.value = item;
  }

  confirm() {
    this.model[this.field.name] = this.value;
    this.close();
  }

  reset() {
    this.model[this.field.name] = null;
    this.dismiss();
  }
}
