'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectsCtrl', ['$location', 'projectsService', ProjectsCtrl]);

  function ProjectsCtrl($location, projectsService) {
    var vm = this;

    vm.list = [];
    vm.initList = function() {vm.list = projectsService.projectResource.query();};
    
  }

})();
