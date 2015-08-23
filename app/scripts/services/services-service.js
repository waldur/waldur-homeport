'use strict';

(function() {
  angular.module('ncsaas')
    .service('servicesService', ['baseServiceClass', '$q', '$http', 'ENV', servicesService]);

  function servicesService(baseServiceClass, $q, $http, ENV) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      services: null,

      init:function() {
        this._super();
        this.endpoint = '/services/';
      },
      getServicesList: function() {
        var vm = this,
          deferred = $q.defer();

        if (vm.services) {
          deferred.resolve(vm.services.toJSON());
        } else {
          vm.$get().then(function(response) {
            vm.services = response;
            deferred.resolve(vm.services.toJSON());
          });
        }

        return deferred.promise;
      },

      getServicesOptions: function() {
        // Collect parameters required for creating new services
        var vm = this,
          deferred = $q.defer();

        if (vm.service_options) {
          deferred.resolve(vm.service_options);
        } else {
          vm.service_options = {};
          var blacklist = ['customer', 'customer_name', 'customer_native_name', 'dummy',
                           'name', 'projects', 'settings', 'url', 'uuid', 'cpu_overcommit_ratio'];

          vm.getServicesList().then(function(services) {
            var promises = [];
            var names = [];

            for(var name in services) {
              promises.push($http({url: services[name].url, method: 'options'}));
              names.push(name);
              vm.service_options[name] = {
                name: name,
                url: services[name].url,
                options: [],
                serviceProjectLinkUrl: ENV.apiEndpoint + 'api/' + name.toLowerCase() + '-service-project-link/'
              };
            }

            $q.all(promises).then(function(responses) {
              for (var i = 0; i < responses.length; i++) {
                var name = names[i];
                var options = responses[i].data.actions.POST;

                for(var key in options) {
                  var option = options[key];
                  if (!option.read_only && blacklist.indexOf(key) == -1) {
                    var item = {
                      key: key,
                      label: option.label,
                      help_text: option.help_text
                    };
                    if (option.choices) {
                      item.choices = option.choices;
                    }
                    vm.service_options[name].options.push(item);
                  }
                }
              }
              deferred.resolve(vm.service_options);
            });
          })
        }
        return deferred.promise;
      }
    });
    return new ServiceClass();
  }

})();
