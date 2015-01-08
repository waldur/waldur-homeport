'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectsCtrl', ['$location', 'projectsService', ProjectsCtrl]);

  function ProjectsCtrl($location, projectsService) {
    var vm = this;
    vm.list = list;
    vm.projects = [];

    function list() {
      projectsService.list().then(
        function(response) {
          vm.projects = response.data;
        },
        function(response) {
          alert(response);
        });
    }

  }

})();
