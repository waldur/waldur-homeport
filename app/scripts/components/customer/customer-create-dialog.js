import template from './customer-create-dialog.html';

export default function customerCreateDialog() {
  return {
    restrict: 'E',
    controller: CustomerCreateDialogController,
    template: template,
  };
}

// @ngInject
function CustomerCreateDialogController(customersService, $scope, $rootScope, $state, ncUtilsFlash, coreUtils) {
  angular.extend($scope, {
    fields: ['name', 'contact_details', 'registration_code', 'vat_code'],
    instance: {},
    init: function() {
      if (this.customer) {
        this.copyFields(this.customer, this.instance, this.fields);
      }
      this.loadCountries();
    },
    loadCountries: function() {
      function find(list, predicate) {
        return (list.filter(predicate) || [])[0];
      }
      var vm = this;
      return customersService.loadCountries().then(function(countryChoices) {
        vm.countryChoices = countryChoices;
        if (vm.customer) {
          vm.instance.country = find(countryChoices, function(country) {
            return country.value === vm.customer.country;
          });
        }
      });
    },
    saveCustomer: function() {
      var vm = this;
      return vm.getPromise().then(function(customer) {
        vm.errors = {};
        customersService.clearAllCacheForCurrentEndpoint();
        $rootScope.$broadcast('refreshCounts');

        if (vm.customer) {
          var message = coreUtils.templateFormatter(gettext('Organization {organizationName} is updated.'),
            {organizationName: customer.name});
          ncUtilsFlash.success(message);
          $rootScope.$broadcast('refreshCustomerList', {
            model: customer,
            update: true
          });
        } else {
          ncUtilsFlash.success(gettext('Organization has been created.'));
          $rootScope.$broadcast('refreshCustomerList', {
            model: customer,
            new: true,
            current: true
          });
          $state.go('organization.details', {uuid: customer.uuid});
        }

        vm.$close(customer);
      }, function(response) {
        vm.errors = response.data;
      });
    },
    getPromise: function() {
      if (this.customer) {
        return customersService.$update(null, this.customer.url, this.getOptions());
      } else {
        var customer = customersService.$create();
        angular.extend(customer, this.getOptions());
        return customer.$save();
      }
    },
    copyFields: function(src, dest, names) {
      angular.forEach(names, function(name) {
        if (src[name]) {
          dest[name] = src[name];
        }
      });
    },
    getOptions: function() {
      var options = {};
      this.copyFields(this.instance, options, this.fields);
      if (this.instance.vat_code) {
        options.is_company = true;
      }
      if (this.instance.country) {
        options.country = this.instance.country.value;
      }
      return options;
    }
  });
  $scope.init();
}
