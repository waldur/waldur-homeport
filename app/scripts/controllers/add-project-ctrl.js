'use strict';

(function() {
  angular.module('ncsaas')
    .controller('AddProjectsCtrl', ['$location', 'projectsService', AddProjectsCtrl]);

  function AddProjectsCtrl($location, projectsService) {
    var vm = this;

    vm.project = new projectsService.projectResource();

    vm.initAddProject = function() {
      vm.projectForm = ''; // form data 
      project.save(vm.projectForm, function() {
        console.log('ok');
      });
    };    
    
  }

})();
