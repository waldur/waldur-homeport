import template from './dashboard-feed.html';

export const projectEventsFeed = {
  template,
  bindings: {
    project: '<'
  },
  controller: class ProjectEventsFeedController {
    constructor(DashboardFeedService, EventDialogsService) {
      this.DashboardFeedService = DashboardFeedService;
      this.title = gettext('Events');
      this.buttonTitle = gettext('Event types');
      this.emptyText = gettext('No events yet.');
      this.showTypes = EventDialogsService.eventTypes.bind(EventDialogsService);
      this.listState = 'project.events({uuid: $ctrl.project.uuid})';
    }

    $onInit() {
      this.loadItems();
    }

    $onChange() {
      this.loadItems();
    }

    loadItems() {
      if (!this.project) {
        return;
      }
      this.loading = true;
      this.DashboardFeedService.getProjectEvents(this.project).then(items => {
        this.items = items;
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};
