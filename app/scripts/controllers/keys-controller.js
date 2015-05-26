(function() {
  angular.module('ncsaas')
    .controller('KeyAddController', ['baseControllerAddClass', 'keysService', KeyAddController]);

  function KeyAddController(baseControllerAddClass, keysService) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      init: function() {
        this.service = keysService;
        this.controllerScope = controllerScope;
        this.name = 'key';
        this._super();
        this.listState = 'dashboard.eventlog';
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();