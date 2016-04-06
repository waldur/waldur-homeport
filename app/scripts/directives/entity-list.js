'use strict';

(function() {

  angular.module('ncsaas')
    .directive('entitylist', [entityList]);

  function entityList() {
    return {
      restrict: 'E',
      template: '<div ng-include="contentUrl"></div>',
      scope: {
        entityHref: '@',
        entityList: '=',
        entityService: '=',
        entityButtons: '=',
        entityOptions: '=',
        entityViewType: '@'
      },
      link: function(scope) {
        scope.contentUrl = 'views/directives/entity-list/entity-list.html';
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
      staticIconLink: 'staticIconLink',
      entityAccessInfoField: 'entityAccessInfo',
      entityStatusField: 'entityStatus',
      listInField: 'listInField',
      linkOrText: 'linkOrText',
      avatarPictureField: 'avatar',
      icon: 'icon',
      fontIcon: 'fontIcon',
      noType: false,
      showForMobile: true,
      statusCircle: 'statusCircle',
      subtitle: true,
      html: 'html',
      colorState: 'colorState',
      bool: 'bool',
      trimmed: 'trimmed',
      dateShort: 'dateShort',
      currency: 'currency',
      awesomeIcon: 'awesomeIcon'
    });
})();
