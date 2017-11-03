import template from './dashboard-feed.html';

export const projectAlertsFeed = {
  template,
  bindings: {
    project: '<',
  },
  controller: class ProjectAlertsFeedController {
    // @ngInject
    constructor(DashboardFeedService, AlertDialogsService) {
      this.DashboardFeedService = DashboardFeedService;
      this.title = gettext('Alerts');
      this.buttonTitle = gettext('Alert types');
      this.emptyText = gettext('No alerts yet.');
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
