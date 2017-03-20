import template from './sizing.html';

export default function sizing() {
  return {
    restrict: 'E',
    scope: {
      item: '='
    },
    template: template,
    replace: true,
    link: function(scope) {
      scope.item.views = [
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

      scope.providers = [
        {
          name: 'AWS EC1',
          price: 60
        },
        {
          name: 'AWS EC2',
          price: 120
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
        for (var i = 0; scope.item.views.length > i; i++) {
          if (scope.item.views[i].type === type && scope.item.views[i].name === name) {
            scope.item.views[i].count++;
            return;
          }
        }
        scope.item.views.push({
          type: type,
          name: name,
          count: 0
        });
      }
    }
  };
}
