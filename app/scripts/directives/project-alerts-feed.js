'use strict';

(function() {

  angular.module('ncsaas')
    .directive('projectAlertsFeed', projectAlertsFeed);

  function projectAlertsFeed() {
    return {
      restrict: 'E',
      scope: {
        project: '=',
      },
      templateUrl: 'views/directives/dashboard-feed.html',
      controller: 'ProjectAlertsFeedController',
      controllerAs: 'FeedCtrl',
      bindToController: true
    };
  }

  angular.module('ncsaas')
    .controller('ProjectAlertsFeedController', ProjectAlertsFeedController);

  ProjectAlertsFeedController.$inject = ['$scope', 'DashboardFeedService', 'AlertDialogsService'];
  function ProjectAlertsFeedController($scope, DashboardFeedService, AlertDialogsService) {
    var vm = this;
    vm.title = 'Alerts';
    vm.emptyText = 'No alerts yet.';
    vm.showTypes = AlertDialogsService.alertTypes.bind(AlertDialogsService);
    vm.listState = 'project.alerts({uuid: FeedCtrl.project.uuid})';
    activate();

    function activate() {
      $scope.$watch('FeedCtrl.project', render);
      render();
    }

    function render() {
      if (!vm.project) {
        return;
      }
      vm.loading = true;
      DashboardFeedService.getProjectAlerts(vm.project).then(function(items) {
        vm.items = items;
      }).finally(function() {
        vm.loading = false;
      });
    }
  }
})();
