// @ngInject
export default function ProjectWorkspaceController(
  $scope, currentStateService, tabCounterService,
  eventsService, projectsService, $state, AppStoreUtilsService) {
  activate();

  function activate() {
    $scope.items = [
      {
        icon: 'fa-th-large',
        label: gettext('Dashboard'),
        link: 'project.details({uuid: $ctrl.context.project.uuid})',
      },
      {
        icon: 'fa-shopping-cart',
        label: gettext('Service store'),
        feature: 'appstore',
        action: function() {
          return AppStoreUtilsService.openDialog();
        },
        state: 'appstore',
      },
      {
        label: gettext('Resources'),
        icon: 'fa-files-o',
        link: 'project.resources',
        children: [
          {
            link: 'project.resources.vms({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-desktop',
            label: gettext('Virtual machines'),
            feature: 'vms',
            countFieldKey: 'vms'
          },
          {
            link: 'project.resources.clouds({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-cloud',
            label: gettext('Private clouds'),
            feature: 'private_clouds',
            countFieldKey: 'private_clouds'
          },
          {
            link: 'project.resources.apps({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-cube',
            label: gettext('Applications'),
            feature: 'apps',
            countFieldKey: 'apps'
          },
          {
            link: 'project.resources.storage.tabs({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-hdd-o',
            label: gettext('Storage'),
            feature: 'storage',
            countFieldKey: 'storages'
          },
          {
            link: 'project.resources.offerings({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-cog',
            label: gettext('Requested Services'),
            feature: 'offering',
          }
        ]
      },
      {
        link: 'project.support({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-question-circle',
        label: gettext('Support'),
        feature: 'premiumSupport',
        countFieldKey: 'premium_support_contracts'
      },
      {
        link: 'project.events({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-bell-o',
        label: gettext('Audit logs'),
        feature: 'eventlog'
      },
      {
        link: 'project.issues({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-question-circle',
        label: gettext('Issues'),
        feature: 'support'
      },
      {
        link: 'project.alerts({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-fire',
        label: gettext('Alerts'),
        feature: 'alerts',
        countFieldKey: 'alerts'
      },
      {
        label: gettext('Team'),
        icon: 'fa-group',
        link: 'project.team({uuid: $ctrl.context.project.uuid})',
        feature: 'team',
        countFieldKey: 'users'
      },
      {
        label: gettext('Cost planning'),
        icon: 'fa-calculator',
        link: 'project.cost-planning({uuid: $ctrl.context.project.uuid})',
        feature: 'cost-planning'
      }
    ];
    $scope.$on('WORKSPACE_CHANGED', function() {
      refreshProject();
    });
    refreshProject();
  }

  function refreshProject() {
    currentStateService.getProject().then(function(project) {
      if (!project) {
        return;
      }
      $scope.currentProject = project;
      $scope.context = {project: project};
      tabCounterService.connect({
        $scope: $scope,
        tabs: $scope.items,
        getCounters: getCounters.bind(null, project),
        getCountersError: getCountersError
      });
    });
  }

  function getCounters(project) {
    const fields = ['vms', 'apps', 'private_clouds', 'storages', 'users'];
    var query = angular.extend(
      {UUID: project.uuid, fields},
      eventsService.defaultFilter
    );
    return projectsService.getCounters(query);
  }

  function getCountersError(error) {
    if (error.status == 404) {
      projectsService.getFirst().then(function(project) {
        $state.go('project.details', {uuid: project.uuid});
      });
    }
  }
}
