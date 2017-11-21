const alertTypesDialog = {
  template: '<types-list-dialog types="$ctrl.types" dialog-title="$ctrl.title" dismiss="$ctrl.dismiss()"/>',
  bindings: {
    dismiss: '&'
  },
  controller: class AlertTypesDialog {
    // @ngInject
    constructor(alertsService) {
      this.alertsService = alertsService;
    }
    $onInit() {
      this.title = gettext('Alert types');
      this.types = this.alertsService.getAvailableIconTypes();
    }
  }
};

export default alertTypesDialog;
