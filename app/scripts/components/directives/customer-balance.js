// @ngInject
export function CustomerBalanceController(
  currentStateService,
  customersService,
  paymentsService,
  ncUtils,
  ENV,
  $scope,
  $state,
  $window,
  coreUtils,
  usersService) {

  function init() {
    if (!ENV.featuresVisible && (ENV.toBeFeatures.indexOf('payment') > -1)) {
      $scope.hideAll = true;
    }
    if (!ENV.enablePurchaseCostDisplay) {
      $scope.hideAll = true;
    }

    $scope.currency = ENV.currency;
    $scope.amount = 10;

    refresh();
  }

  $scope.addCredit = function(amount) {
    var vm = this;
    var payment = paymentsService.$create();
    payment.customer = vm.model.url;
    payment.amount = amount;
    payment.return_url = $state.href('payment.approve', {}, {absolute: true});
    payment.cancel_url = $state.href('payment.cancel', {}, {absolute: true});

    return payment.$save(function(payment) {
      $window.location = payment.approval_url;
      return true;
    });
  };

  function getPercent(usage, limit) {
    return Math.round(Math.max(0, Math.min(100, usage / limit * 100)));
  }

  function getPlan(customer) {
    var usage = ncUtils.getQuotaUsage(customer.quotas),
      currentPlan, currentPlanQuotas;

    if (customer.plan) {
      currentPlan = customer.plan.name;
      currentPlanQuotas = customer.plan.quotas.map(function(quota) {
        var name = ncUtils.getPrettyQuotaName(quota.name);
        var limit = quota.value < 0 ? '∞' : quota.value;
        var quotaUsageMessage = coreUtils.templateFormatter(gettext('{quotaUsage} out of {quotaLimit}.'),
          { quotaUsage: usage[quota.name], quotaLimit: limit });
        return {
          name: name + (quota.value > 1 || quota.value == -1 ? 's' : ''),
          limit: limit,
          usage: usage[quota.name],
          percent: getPercent(usage[quota.name], quota.value),
          quotaUsageMessage: quotaUsageMessage
        };
      });
    } else {
      currentPlan = 'Default';
      currentPlanQuotas = customer.quotas.map(function(quota) {
        var name = ncUtils.getPrettyQuotaName(quota.name);
        return {
          name: name + (quota.limit > 1 || quota.limit == -1 ? 's' : ''),
          limit: quota.limit < 0 ? '∞' : quota.limit,
          usage: usage[quota.name],
          percent: getPercent(usage[quota.name], quota.limit)
        };
      });
    }
    return {
      name: currentPlan,
      quotas: currentPlanQuotas
    };
  }

  function getChart(customer) {
    customersService.getBalanceHistory(customer.uuid).then(function(rows) {
      $scope.showChart = rows.length > 0;

      var labels = rows.map(function(row) {
        return moment(row.created).format('D.MM');
      });
      var totals = rows.map(function(row) {
        return row.amount;
      });

      $scope.chartOptions = {
        responsive: true,
        bezierCurve: false,
        scaleShowGridLines: false
      };

      $scope.d3Data = {
        x: labels,
        y: totals
      };
    });
  }

  $scope.shown = {};

  $scope.toggle = function(id) {
    if (!$scope.shown[id]) {
      $scope.shown[id] = true;
    } else {
      $scope.shown[id] = false;
    }

    for (var i in $scope.shown) {
      if (id != i) {
        $scope.shown[i] = false;
      }
    }
  };

  $scope.isShown = function(id) {
    return $scope.shown[id];
  };

  function refresh() {
    currentStateService.getCustomer().then(function(customer) {
      var currentUser = usersService.currentUser;
      $scope.model = customer;
      $scope.plan = getPlan(customer);
      getChart(customer);
    });

    customersService.isOwnerOrStaff().then(function(isOwnerOrStaff) {
      $scope.showUpgradeButton = isOwnerOrStaff;
    });
  }

  init();
}

// @ngInject
export function customerBalance() {
  return {
    restrict: 'E',
    templateUrl: 'views/directives/customer-balance.html',
    replace: true,
    controller: 'CustomerBalanceController'
  };
}
