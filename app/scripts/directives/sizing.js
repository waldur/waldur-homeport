'use strict';

(function() {

  angular.module('ncsaas')
    .directive('sizing', [sizing]);

  function sizing() {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'views/directives/sizing.html',
      replace: true,
      link: function(scope) {
        scope.views = [
          {
            type: 'WebServer',
            name: 'Apache',
            count: 0
          },
          {
            type: 'Database',
            name: 'MySQL',
            count: 0
          }
        ];

        scope.infrastructures = [
          {
            type: 'WebServer',
            views: [
              'server1',
              'server2'
            ]
          },
          {
            type: 'Database',
            views: [
              'MySQL',
              'MSSQL'
            ]
          },
          {
            type: 'WebServer2',
            views: [
              'server1',
              'server2'
            ]
          },
          {
            type: 'WebServer3',
            views: [
              'server1',
              'server2'
            ]
          }
        ];

        scope.addView = addView;

        function addView(type, name) {
          for (var i = 0; this.views.length > i; i++) {
            if (this.views[i].type === type && this.views[i].name === name) {
              this.views[i].count++;
              return;
            }
          }
          this.views.push({
            type: type,
            name: name,
            count: 0
          });
        }
      }
    };
  }

})();
