'use strict';

(function() {
  angular.module('ncsaas')
    .controller('EventListController', ['baseControllerListClass', 'eventsService', 'EVENTTYPE', EventListController]);

  function EventListController(baseControllerListClass, eventsService, EVENTTYPE) {
    var controllerScope = this;
    var EventController = baseControllerListClass.extend({
      EVENTTYPE: EVENTTYPE,

      init:function() {
        this.service = eventsService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'search';
      }
    });

    controllerScope.__proto__ = new EventController();
  }
})();
