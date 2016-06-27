'use strict';

(function() {
  angular.module('ncsaas')
    .controller('PlansListController',
      ['baseControllerListClass', 'plansService', 'customersService', 'usersService', 'customerPermissionsService',
       'agreementsService', 'ncUtils', '$stateParams', '$state', '$window', '$q', PlansListController]);

  function PlansListController(
      baseControllerListClass, plansService, customersService, usersService, customerPermissionsService,
      agreementsService, ncUtils, $stateParams, $state, $window, $q) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init:function() {
        this.service = plansService;
        this.controllerScope = controllerScope;
        this.checkPermissions();
        this.selectedPlan = null;
        this.helpIconMessage = "Both VMs and applications are counted as resources";
      },

      checkPermissions: function() {
        // check is current user - customer owner and load page if he is
        var vm = this;
        usersService.getCurrentUser().then(function(user) {
          /*jshint camelcase: false */
          customerPermissionsService.userHasCustomerRole(user.username, 'owner', $stateParams.uuid).then(
            function(hasRole) {
              vm.canSeePlans = hasRole;

              if (vm.canSeePlans || user.is_staff) {
                vm.getLimitsAndUsages();
                vm.getList();
              } else {
                $state.go('errorPage.notFound');
              }
            });
        });
      },

      getLimitsAndUsages: function() {
        var vm = this;
        return customersService.$get($stateParams.uuid).then(function(customer) {
          vm.customer = customer;
          vm.currentPlan = customer.plan;
          vm.usage = ncUtils.getQuotaUsage(customer.quotas);
        });
      },

      getPrettyQuotaName: ncUtils.getPrettyQuotaName,

      cancel: function() {
        $state.go('organizations.details', {uuid:$stateParams.uuid});
      },

      selectPlan: function(plan) {
        if (!this.currentPlan || plan.url !== this.currentPlan.url) {
          this.selectedPlan = plan;
        } else {
          this.selectedPlan = null;
        }
      },

      createOrder: function() {
        var vm = this,
          order = agreementsService.$create();
        if (vm.selectedPlan !== null) {
          order.plan = vm.selectedPlan.url;
          order.customer = vm.customer.url;
          order.return_url = $state.href('agreement.approve', {}, {absolute: true});
          order.cancel_url = $state.href('agreement.cancel', {}, {absolute: true});

          return order.$save(function(order) {
            customersService.clearAllCacheForCurrentEndpoint();
            $window.location = order.approval_url;
            return true;
          });
        }
        return $q.reject();
      }

    });

    controllerScope.__proto__ = new Controller();
  }

  angular.module('ncsaas')
  .controller('AgreementApproveController',
    ['ncUtils',
     'ncUtilsFlash',
     'agreementsService',
     '$state',
     'currentStateService',
     'baseControllerClass',
     AgreementApproveController]);

  function AgreementApproveController(
    ncUtils,
    ncUtilsFlash,
    agreementsService,
    $state,
    currentStateService,
    baseControllerClass) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this._super();
        this.approveAgreement();
      },
      approveAgreement: function() {
        var qs = ncUtils.parseQueryString(ncUtils.getQueryString());
        if (!qs.token) {
          ncUtilsFlash.error('Invalid URL. Unable to parse billing plan agreement details.');
          return;
        }
        agreementsService.approve({token: qs.token}).then(function(response) {
          ncUtilsFlash.success('Billing plan agreement has been processed successfully.');
          currentStateService.reloadCurrentCustomer();
          $state.go('home.home', {});
        }, function(error) {
          if (error.data) {
            ncUtilsFlash.error(error.data.detail);
          } else {
            ncUtilsFlash.error('Unable to approve billing plan');
          }
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }

  angular.module('ncsaas')
  .controller('AgreementCancelController',
    ['ncUtils',
     'ncUtilsFlash',
     'agreementsService',
     '$state',
     'baseControllerClass',
     AgreementCancelController]);

  function AgreementCancelController(
    ncUtils,
    ncUtilsFlash,
    agreementsService,
    $state,
    baseControllerClass) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this._super();
        this.cancelAgreement();
      },
      cancelAgreement: function() {
        var qs = ncUtils.parseQueryString(ncUtils.getQueryString());
        if (!qs.token) {
          ncUtilsFlash.error('Invalid URL. Unable to parse billing plan agreement details.');
          return;
        }
        agreementsService.cancel({token: qs.token}).then(function(response) {
          ncUtilsFlash.success('Billing plan agreement has been processed successfully.');
          $state.go('home.home', {});
        }, function(error) {
          if (error.data) {
            ncUtilsFlash.error(error.data.detail);
          } else {
            ncUtilsFlash.error('Unable to cancel billing plan');
          }
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
