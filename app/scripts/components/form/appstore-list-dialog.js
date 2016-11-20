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

class DialogController {
  constructor() {
    this.field = this.resolve.field;
    this.model = this.resolve.model;
    this.value = this.model[this.field.name];
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
