import template from './dashboard-feed.html';

export const projectAlertsFeed = {
  template,
  bindings: {
    project: '<',
  },
  controller: class ProjectAlertsFeedController {
    constructor(DashboardFeedService, AlertDialogsService) {
      this.DashboardFeedService = DashboardFeedService;
      this.title = 'Alerts';
      this.emptyText = 'No alerts yet.';
      this.showTypes = AlertDialogsService.alertTypes.bind(AlertDialogsService);
      this.listState = 'project.alerts({uuid: $ctrl.project.uuid})';
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
      this.DashboardFeedService.getProjectAlerts(this.project).then(items => {
        this.items = items;
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};
