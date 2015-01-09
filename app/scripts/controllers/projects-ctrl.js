'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectsCtrl', ['$scope', '$location', 'projectsService', ProjectsCtrl]);

  function ProjectsCtrl($scope, $location, projectsService) {
    var vm = this;

    vm.testvar = 'strong'

    $scope.initList = function() {
        vm.projects = projectsService.projectResource.query();
    };

  }

})();
