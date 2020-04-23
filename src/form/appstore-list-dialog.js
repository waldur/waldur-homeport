import { translate } from '@waldur/i18n';

import template from './appstore-list-dialog.html';

class DialogController {
  $onInit() {
    this.field = this.resolve.field;
    this.model = this.resolve.model;
    this.value = this.model[this.field.name];
    this.title =
      this.field.dialogTitle ||
      translate('Select {fieldLabel}', {
        fieldLabel: this.field.label,
      });
    this.choices = this.field.choices;
    this.columns = this.field.columns;
    this.filterOptions = this.field.filterOptions;
    if (this.field.concealEmptyOptions) {
      this.filterOptions = this.field.concealEmptyOptions(
        this.field.choices,
        this.field.filterOptions,
      );
    }
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

export default function appstoreListDialog() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&',
      resolve: '=',
    },
    controller: DialogController,
    controllerAs: '$ctrl',
  };
}
