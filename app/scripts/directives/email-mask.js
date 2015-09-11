'use strict';

(function() {
  angular.module('ncsaas')
    .directive('emailMask', ['ENV', detailsView]);

  function detailsView(ENV) {
    return {
      restrict: 'E',
      template: '<input type="text" ng-model="model" ng-focus="focus()" ng-change="change($event)" placeholder="Email">',
      replace: true,
      scope: {
        model: '=maskModel',
      },
      link: function(scope, element) {
        scope.change = change;
        scope.focus = focus;
        var end = ENV.emailMask;
        function change() {
          if (end) {
            var string = scope.model;
            var name = string.split('@')[0];
            var dom = string.split('@')[1];
            if (dom) {
              if (end.length > dom.length) {
                var different = end.length - dom.length;
                name = name.slice(0, - different);
                if (!name) {
                  scope.model = '@' + end;
                }
              }
              if (end.length < dom.length) {
                name += dom.replace(end, '');
              }
            }
            if (name) {
              scope.model = name + '@' + end;
              moveCursor(name.length);
            }
          }
        }

        function focus() {
          if (end) {
            var string = scope.model;
            if (string) {
              var name = string.split('@')[0];
              moveCursor(name.length);
            } else {
              scope.model = '@' + end;
              moveCursor(0);
            }
          }
        }

        function moveCursor(position) {
          setTimeout(function() {
            element[0].selectionEnd = position;
          }, 0);
        }

      }
    };
  }
})();
