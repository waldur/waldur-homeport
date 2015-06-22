(function() {
  angular.module('ncsaas')
    .controller('StatisticProjectsController',
      ['baseControllerClass', 'statisticsService', 'STATTYPEENDPOINT', StatisticProjectsController]);

  function StatisticProjectsController(baseControllerClass, statisticsService, STATTYPEENDPOINT) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      statistic: null,

      init: function() {
        this._super();
        var vm = this;
        statisticsService.endpointPostfix = STATTYPEENDPOINT.creationTime;
        statisticsService.getList({type: 'project'}).then(function(response) {
          var projectStatValues = response.map(function(stat) {
            return stat.value;
          });
          vm.statistic = {};
          vm.statistic.data = [projectStatValues];
          vm.statistic.labels = response.map(function(stat) {
            return vm.getDate(stat.from) + ' - ' + vm.getDate(stat.to);
          });
        });

      },
      getDate: function(time) {
        var date = new Date(time);
        return date.getDay() + '.' + (date.getMonth() + 1) + '.' + date.getYear() + ' '
          + date.getHours() + ':' + date.getMinutes();
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
