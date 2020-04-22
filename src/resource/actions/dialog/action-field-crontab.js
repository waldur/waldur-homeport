const actionFieldCrontab = {
  template:
    '<cron-selection ng-model="$ctrl.model[$ctrl.field.name]" config="$ctrl.field.config"></cron-selection>',
  bindings: {
    model: '<',
    field: '<',
  },
  controller: class Controller {
    $onInit() {
      this.field.config = this.field.config || {
        options: {
          allowMinute: false,
        },
      };
    }
  },
};

export default actionFieldCrontab;
