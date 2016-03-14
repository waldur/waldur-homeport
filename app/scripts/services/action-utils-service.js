'use strict';

(function() {
  angular.module('ncsaas')
    .service('actionUtilsService', [
      'ncUtilsFlash', '$rootScope', '$http', 'ngDialog', 'resourcesService', actionUtilsService]);

  function actionUtilsService(ncUtilsFlash, $rootScope, $http, ngDialog, resourcesService) {
    this.loadActions = function(model) {
      return resourcesService.getOption(model.url);
    };

    this.buttonClick = function(controller, model, name, action) {
      if (action.type === 'button') {
        if (action.destructive) {
          if (this.confirmAction(model, name)) {
            this.applyAction(controller, model, name, action);
          }
        } else {
          this.applyAction(controller, model, name, action);
        }
      } else if (action.type === 'form') {
        this.openActionDialog(controller, model, action);
      }
    };

    this.confirmAction = function(model, name) {
      if (name === 'destroy') {
        var confirmText = (model.state === 'Erred')
          ? 'Are you sure you want to delete a {resource_type} in an Erred state?' +
            ' A cleanup attempt will be performed if you choose so.'
          : 'Are you sure you want to delete a {resource_type}?';
        return confirm(confirmText.replace('{resource_type}', model.resource_type));
      } else {
        return confirm('Are you sure? This action cannot be undone.');
      }
    };

    this.applyAction = function(controller, resource, name, action) {
      var vm = this;
      var promise = (action.method == 'DELETE') ? $http.delete(action.url) : $http.post(action.url);

        promise.then(function(response) {
          if (response.status == 204) {
            ncUtilsFlash.success('Resource has been deleted');
            controller.afterInstanceRemove(resource);
          } else {
            vm.handleActionSuccess(action);
            controller.reInitResource(resource);
          }
        },
        controller.handleActionException.bind(controller)
      );
    };

    this.handleActionSuccess = function(action) {
      var template = "Request to {action} has been accepted";
      var message = template.replace("{action}", action.title.toLowerCase());
      ncUtilsFlash.success(message);
    };

    this.openActionDialog = function(controller, resource, action) {
      var dialogScope = $rootScope.$new();
      dialogScope.action = action;
      dialogScope.controller = controller;
      dialogScope.resource = resource;
      ngDialog.open({
        templateUrl: 'views/directives/action-dialog.html',
        className: 'ngdialog-theme-default',
        scope: dialogScope
      });
    };
  }

})();
