'use strict';

(function() {

  angular.module('ncsaas')
    .directive('entitylist', [entityList]);

  function entityList() {
    var directiveViewPath = 'views/directives/entity-list/',
      defaultView = directiveViewPath + 'entity-list.html';
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
        scope.contentUrl = scope.entityViewType
          ? directiveViewPath + 'entity-list-' + scope.entityViewType + '.html'
          : defaultView;
        scope.colorSateHelpView = directiveViewPath + 'status-color-help.html';
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
      bool: 'bool'
    })
})();
