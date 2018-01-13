import template from './alert-event-groups.html';

const alertsEventGroups = {
  template: template,
  controller: class AlertsEventGroupsController {
    // @ngInject
    constructor(alertsService) {
      this.alertsService = alertsService;
    }

    $onInit() {
      this.types = this.alertsService.getAvailableEventGroups();
    }
  }
};

export default alertsEventGroups;
