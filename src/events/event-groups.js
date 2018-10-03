import template from './event-groups.html';

const eventGroups = {
  template: template,
  controller: class eventGroupsController {
    // @ngInject
    constructor(eventsService) {
      this.eventsService = eventsService;
    }

    $onInit() {
      this.types = this.eventsService.getAvailableEventGroups();
    }
  }
};

export default eventGroups;
