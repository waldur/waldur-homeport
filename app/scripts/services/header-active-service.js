'use strict';

(function() {
  angular.module('ncsaas')
    .service('HeaderActiveService', [HeaderActiveService]);

    function HeaderActiveService() {
      /*jshint validthis: true */
      var vm = this;
      vm.getActiveItem = getActiveItem;

      var urlList = {
        'dashboard': ['dashboard'],
        'resources': ['resources'],
        'projects': ['projects', 'project', 'project-edit', 'projects-add'],
        'services': ['services'],
        'users': ['users', 'user']
      }

      function getActiveItem(stateName) {
        var activeState;
        for (var prop in urlList) {
          if (urlList.hasOwnProperty(prop)) {
            if (urlList[prop].indexOf(stateName) !== -1) {
              activeState = prop;
            }
          }
        }
        return activeState;
      }
    }

})();
