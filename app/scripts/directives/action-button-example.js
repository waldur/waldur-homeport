'use strict';

(function() {
  angular.module('ncsaas')
    .directive('actionButtonExample', ['$rootScope', 'resourcesService', 'ENV', actionButtonExample]);

  function actionButtonExample($rootScope, resourcesService, ENV) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/action-button-example.html",
      replace: true,
      scope: {
        buttonController: '=',
        buttonModel: '=', // using in ng-click="button.clickFunction(buttonModel)"
        buttonType: '@'
      },
      link: function (scope) {
        var item = scope.buttonModel;

        scope.errors = {};

        resourcesService.getOption([item.url].join('')).then(function(response) {
          if (response.actions) {
            scope.actions = response.actions;
          }
        });

        scope.buttonList = item.actions;
        scope.buttonClick = buttonClick;
        scope.submitForm = submitForm;
        scope.getSelectList = getSelectList;

        var controller = scope.buttonController;
        controller.actionButtonsList = controller.actionButtonsList || [];
        controller.actionButtonsList[scope.$id] = false;
        scope.openActionsListTrigger = openActionsListTrigger;

        function buttonClick(model, action) {
          var option = scope.actions[action],
              url = option.method == 'DELETE' ? model.url : model.url + action;
          scope.form = resourcesService.$create(url);
          if (option.type === 'button') {
            if (option.destructive) {
              if (confirm('Are you sure? This action cannot be undone.')) {
                scope.form.$save();
              }
            } else {
              scope.form.$save();
            }
          } else if (option.type === 'form') {
            getSelectList(action);
            scope.buttonModel.show_form = scope.buttonModel.show_form === action ? false : action;
          }
        }

        function getSelectList(action) {
          var option = scope.actions[action];
          for (var field in option.fields) {
            option.fields[field].url && resourcesService.getList({}, option.fields[field].url).then(function(response) {
              option.fields[field].list = response;
            });
          }
        }

        function submitForm() {
          var option = scope.actions[scope.buttonModel.show_form];
          for (var field in option.fields) {
            if (option.fields[field].required && !scope.form[field]) {
              scope.errors[field] = ['This field is required'];
              return;
            }
          }
          scope.form.$save(function() {
            scope.errors = {};
          }, function(errors) {
            scope.errors = errors;
          });
        }

        function openActionsListTrigger() {
          if (!controller.actionButtonsList[scope.$id]) {
            scope.$broadcast('actionButton:close');
          }
          controller.actionButtonsList[scope.$id] = !controller.actionButtonsList[scope.$id];
        }

        function closeAll() {
          for (var i = 0; controller.actionButtonsList.length > i; i++) {
            controller.actionButtonsList[i] = false;
          }
        }

        scope.$on('actionButton:close', closeAll);
        $rootScope.$on('clicked-out', closeAll);
      }
    };
  }

})();
