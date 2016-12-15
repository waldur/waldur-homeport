'use strict';

(function() {

  angular.module('ncsaas')
    .directive('projectEventsFeed', projectEventsFeed);

  function projectEventsFeed() {
    return {
      restrict: 'E',
      scope: {
        project: '=',
      },
      templateUrl: 'views/directives/dashboard-feed.html',
      controller: 'ProjectEventsFeedController',
      controllerAs: 'FeedCtrl',
      bindToController: true
    };
  }

  angular.module('ncsaas')
    .controller('ProjectEventsFeedController', ProjectEventsFeedController);

  ProjectEventsFeedController.$inject = ['$scope', 'DashboardFeedService', 'EventDialogsService'];
  function ProjectEventsFeedController($scope, DashboardFeedService, EventDialogsService) {
    var vm = this;
    vm.title = 'Events';
    vm.emptyText = 'No events yet.';
    vm.showTypes = EventDialogsService.eventTypes.bind(EventDialogsService);
    vm.listState = 'project.events({uuid: FeedCtrl.project.uuid})';
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
      DashboardFeedService.getProjectEvents(vm.project).then(function(items) {
        vm.items = items;
      }).finally(function() {
        vm.loading = false;
      });
    }
  }
})();
