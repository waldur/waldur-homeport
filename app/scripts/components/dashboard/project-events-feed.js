import template from './dashboard-feed.html';

export const projectEventsFeed = {
  template,
  bindings: {
    project: '<'
  },
  controller: class ProjectEventsFeedController {
    constructor(DashboardFeedService, EventDialogsService, $uibModal) {
      this.DashboardFeedService = DashboardFeedService;
      this.$uibModal = $uibModal;
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
        this.items = items.filter(item => {
          // filter out issue update events as there are too many of them.
          return item.event_type && item.event_type !== 'issue_update_succeeded';
        });
      }).finally(() => {
        this.loading = false;
      });
    }

    showDetails(event) {
      return this.$uibModal.open({
        component: 'eventDetailsDialog',
        resolve: {
          event: () => event,
        }
      }).result;
    }
  }
};
