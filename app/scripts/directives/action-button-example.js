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
        var OPTIONS = { // fixture
          $actions: { // actions objects
            unlink: { // action for empty request
              title: "Unlink",
              type: "button",
              confirm: true,
              confirmation_text: 'Are you sure?',
              request_type: 'POST',
              url: "http://example.com/{endpoint}/{uuid}/unlink"
            },
            destroy: {
              title: "Destroy",
              type: "button",
              confirm: true,
              confirmation_text: 'Are you sure?',
              request_type: 'POST',
              url: "http://example.com/{endpoint}/{uuid}/destroy"
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
                  url: 'http://rest-test.nodeconductor.com/api/projects/',
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
          $actions: [ // actions objects
            {
              enabled: true,
              reason: '',
              name: 'unlink'
            },
            {
              enabled: true,
              reason: '',
              name: 'add_member'
            },
            {
              enabled: true,
              reason: '',
              name: 'add_project'
            },
            {
              enabled: false,
              reason: 'Invalid state',
              name: 'destroy'
            }
          ],
          endpoint: 'digitalocean' // need to add this variable to all resources
        };

        scope.errors = {};

        resourcesService.getOption([ENV.apiEndpoint, 'api/', item.endpoint].join('')).then(function(response) {
          if (response['$actions']) {
            scope.actions = response['$actions'];
          }
        });

        scope.buttonList = scope.buttonModel['$actions'] || item['$actions'];
        scope.actions = OPTIONS['$actions'];
        scope.buttonClick = buttonClick;
        scope.submitForm = submitForm;
        scope.getSelectList = getSelectList;

        var controller = scope.buttonController;
        controller.actionButtonsList = controller.actionButtonsList || [];
        controller.actionButtonsList[scope.$id] = false;
        scope.openActionsListTrigger = openActionsListTrigger;

        function buttonClick(model, action) {
          var option = scope.actions[action],
              url = option.url.replace('{endpoint}', model.endpoint).replace('{uuid}', model.uuid);
          scope.form = resourcesService.$create(url);
          if (option.type === 'button') {
            if (option.confirm) {
              if (confirm(option.confirmation_text)) {
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
