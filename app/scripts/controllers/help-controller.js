(function() {

  angular.module('ncsaas')
    .controller('HelpListController', ['baseControllerClass', 'ENV', HelpListController]);

  function HelpListController(baseControllerClass, ENV) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this.list = ENV.helpList;
        this._super();
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();

(function() {

  angular.module('ncsaas')
    .controller('HelpDetailsController', ['baseControllerClass', 'ENV', '$stateParams', HelpDetailsController]);

  function HelpDetailsController(baseControllerClass, ENV, $stateParams) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this.getItem();
        this._super();
      },
      getItem: function() {
        var list = ENV.helpList;
        for (var i = 0; i < list.length; i++) {
          if (list[i].name == $stateParams.name) {
            this.model = list[i];
            break;
          }
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
