const actionFieldCrontab = {
  template: '<cron-selection ng-model="$ctrl.model[$ctrl.field.name]"></cron-selection>',
  bindings: {
    model: '<',
    field: '<',
  },
};

export default actionFieldCrontab;
