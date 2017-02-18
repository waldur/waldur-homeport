const actionFieldCrontab = {
  template: '<cron-selection ng-model="$ctrl.model[$ctrl.field.name]" config="$ctrl.field.config"/>',
  bindings: {
    model: '<',
    field: '<',
  },
  controller: function() {
    this.field.config = this.field.config || {
      options: {
        allowMinute: false
      }
    };
  }
};

export default actionFieldCrontab;
