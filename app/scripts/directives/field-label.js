'use strict';

(function() {

  angular.module('ncsaas')
    .directive('fieldLabel', [fieldLabel]);

  function fieldLabel() {
    return {
      restrict: 'E',
      template: "{{ field.label }} {{ field.required && '*' || '' }}",
      scope: {
        field: '='
      }
    };
  }
})();
