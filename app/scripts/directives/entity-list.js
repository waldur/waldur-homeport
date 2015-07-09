'use strict';

(function() {

  angular.module('ncsaas')
    .directive('entitylist', [entityList]);

  function entityList() {
    return {
      restrict: 'E',
      templateUrl: "views/directives/entity-list.html",
      replace: true,
      scope: {
        entityHref: '@',
        entityList: '=',
        entityService: '=',
        entityButtons: '=',
        entityOptions: '=',
        optionsForExpandable: '=entityExpandableOptions',
        optionsForMinipagination: '=entityMinipaginationOptions'
      }
    };
  }

})();

(function() {
  angular.module('ncsaas')
    .constant('ENTITYLISTFIELDTYPES', {
      date: 'date',
      dateCreated: 'dateCreated',
      name: 'name',
      link: 'link',
      entityAccessInfoField: 'entityAccessInfo',
      entityStatusField: 'entityStatus',
      listInField: 'listInField',
      avatarPictureField: 'avatar',
      noType: false,
      showForMobile: true
    })
})();
