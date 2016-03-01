'use strict';

(function() {
  angular.module('ncsaas')
    .directive('actionButtonExample', ['$rootScope', 'resourcesService', actionButtonExample]);

  function actionButtonExample($rootScope, resourcesService) {
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
        var OPTIONS = { // fixture
          $actions: { // actions objects
            unlink: { // action for empty request
              title: "Unlink",
              type: "button",
              request_type: 'POST',
              url: "http://example.com/{endpoint}/{uuid}/unlink"
            },
            add_member: { // action for request with field
              title: "Add member",
              type: "form",
              request_type: 'POST',
              url: "http://example.com/{endpoint}/{uuid}/add_member",
              fields: {
                user_name: {
                  type: 'text',
                  required: true,
                  label: 'User name'
                }
              }
            },
            add_project: {
              title: 'Add project',
              type: "form",
              request_type: 'POST',
              url: "http://example.com/{endpoint}/{uuid}/add_project",
              fields: {
                select_list: { // params for getting list for select box
                  type: 'select',
                  required: true,
                  url: '{url}',
                  filters: ['customer_uuid'],
                  label: 'Project'
                }
              }
            }
          }
        };

        var item = { // fixture
          uuid: " 90bcfe38b0124c9bbdadd617b5d739f5",
          name: "name",
          $actions: ['unlink', 'add_member'],  // actions objects
          endpoint: 'digitalocean' // need to add this variable to all resources
        };

        scope.buttonList = item['$actions'];
        scope.actions = OPTIONS['$actions'];
        scope.buttonClick = buttonClick;
        scope.submitForm = submitForm;

        var controller = scope.buttonController;
        controller.actionButtonsList = controller.actionButtonsList || [];
        controller.actionButtonsList[scope.$id] = false;
        scope.openActionsListTrigger = openActionsListTrigger;

        function buttonClick(model, action) {
          var option = scope.actions[action],
              url = option.url.replace('{endpoint}', model.endpoint).replace('{uuid}', model.uuid);
          scope.form = resourcesService.$create(url);
          if (option.type === 'button') {
            scope.form.$save();
          } else if (option.type === 'form') {
            scope.buttonModel['show_form' + action] = !scope.buttonModel['show_form' + action];
          }
        }

        function submitForm() {
          scope.form && scope.form.$save();
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
