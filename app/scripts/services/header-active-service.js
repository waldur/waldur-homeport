'use strict';

(function() {
  angular.module('ncsaas')
    .service('HeaderActiveService', ['$state', HeaderActiveService]);

    function HeaderActiveService($state) {
      var vm = this;

      vm.getStateForDashboard = getStateForDashboard;
      vm.getStateForResources = getStateForResources;
      vm.getStateForProjects = getStateForProjects;
      vm.getStateForServices = getStateForServices;
      vm.getStateForUsers = getStateForUsers;

      function getState(list) {
        return (list.indexOf($state.current.name) !== -1)? true:false;
      }

      function getStateForDashboard() {
        var statesList = [
          'dashboard'
        ];
        return getState(statesList)
      }

      function getStateForResources() {
        var statesList = [
          'resources'
        ];
        return getState(statesList)
      }

      function getStateForProjects() {
        var statesList = [
          'projects',
          'project',
          'project-edit',
          'projects-add'
        ];
        return getState(statesList)
      }

      function getStateForServices() {
        var statesList = [
          'services'
        ];
        return getState(statesList)
      }

      function getStateForUsers() {
        var statesList = [
          'users',
          'user'
        ];
        return getState(statesList)
      }
    }

})();
