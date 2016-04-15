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
      },
      getServicesList: function() {
        var vm = this,
          deferred = $q.defer();
        vm.endpoint = '/service-metadata/';
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
          var blacklist = ['name', 'cpu_overcommit_ratio'];
          var types = ['string', 'choice', 'boolean', 'url', 'file upload'];

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
                serviceProjectLinkUrl: services[name].service_project_link_url
              };
            }

            $q.all(promises).then(function(responses) {
              for (var i = 0; i < responses.length; i++) {
                var name = names[i];
                var options = responses[i].data.actions.POST;

                for(var key in options) {
                  var option = options[key];
                  if (!option.read_only && types.indexOf(option.type) != -1 && blacklist.indexOf(key) == -1) {
                    var item = {
                      key: key,
                      type: option.type,
                      label: option.label,
                      help_text: option.help_text,
                      required: option.required
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
