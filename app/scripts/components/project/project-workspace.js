// @ngInject
export default function ProjectWorkspaceController(
  $scope,
  currentStateService,
  tabCounterService,
  eventsService,
  projectsService,
  $state,
  AppStoreUtilsService,
  SidebarExtensionService) {

  activate();

  function activate() {
    $scope.$on('WORKSPACE_CHANGED', function() {
      refreshProject();
    });
    refreshProject();
  }

  function setItems(customItems) {
    $scope.items = [
      {
        icon: 'fa-th-large',
        label: gettext('Dashboard'),
        link: 'project.details({uuid: $ctrl.context.project.uuid})',
        index: 100,
      },
      {
        icon: 'fa-shopping-cart',
        label: gettext('Service store'),
        feature: 'appstore',
        action: function() {
          return AppStoreUtilsService.openDialog();
        },
        state: 'appstore',
        index: 200,
      },
      {
        label: gettext('Resources'),
        icon: 'fa-files-o',
        link: 'project.resources',
        key: 'resources',
        index: 300,
        children: [
          {
            link: 'project.resources.vms({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-desktop',
            label: gettext('Virtual machines'),
            feature: 'vms',
            countFieldKey: 'vms',
            index: 100,
          },
          {
            link: 'project.resources.clouds({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-cloud',
            label: gettext('Private clouds'),
            feature: 'private_clouds',
            countFieldKey: 'private_clouds',
            index: 200,
          },
          {
            link: 'project.resources.storage.tabs({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-hdd-o',
            label: gettext('Storage'),
            feature: 'storage',
            countFieldKey: 'storages',
            index: 400,
          },
          {
            link: 'project.resources.offerings({uuid: $ctrl.context.project.uuid})',
            icon: 'fa-cog',
            label: gettext('Requested Services'),
            feature: 'offering',
            index: 500,
          },
        ]
      },
      {
        link: 'project.support({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-question-circle',
        label: gettext('Support'),
        feature: 'premiumSupport',
        countFieldKey: 'premium_support_contracts',
        index: 400,
      },
      {
        link: 'project.events({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-bell-o',
        label: gettext('Audit logs'),
        feature: 'eventlog',
        index: 500,
      },
      {
        link: 'project.issues({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-question-circle',
        label: gettext('Issues'),
        feature: 'support',
        index: 600,
      },
      {
        link: 'project.alerts({uuid: $ctrl.context.project.uuid})',
        icon: 'fa-fire',
        label: gettext('Alerts'),
        feature: 'alerts',
        countFieldKey: 'alerts',
        index: 700,
      },
      {
        label: gettext('Team'),
        icon: 'fa-group',
        link: 'project.team({uuid: $ctrl.context.project.uuid})',
        feature: 'team',
        key: 'team',
        countFieldKey: 'users',
        index: 800,
      },
      {
        label: gettext('Cost planning'),
        icon: 'fa-calculator',
        link: 'project.cost-planning({uuid: $ctrl.context.project.uuid})',
        feature: 'cost-planning',
        index: 900,
      }
    ];
    $scope.items = SidebarExtensionService.mergeItems($scope.items, customItems);
  }

  function refreshProject() {
    currentStateService.getProject().then(function(project) {
      if (!project) {
        return;
      }
      $scope.currentProject = project;
      $scope.context = {project: project};
      SidebarExtensionService.getItems('project').then(customItems => {
        setItems(customItems);
        tabCounterService.connect({
          $scope: $scope,
          tabs: $scope.items,
          getCounters: getCounters.bind(null, project),
          getCountersError: getCountersError
        });
      });
    });
  }

  function getCounters(project) {
    const fields = ['vms', 'apps', 'private_clouds', 'storages', 'users'];
    let query = angular.extend(
      {UUID: project.uuid, fields},
      eventsService.defaultFilter
    );
    return projectsService.getCounters(query);
  }

  function getCountersError(error) {
    if (error.status === 404) {
      projectsService.getFirst().then(function(project) {
        $state.go('project.details', {uuid: project.uuid});
      });
    }
  }
}
