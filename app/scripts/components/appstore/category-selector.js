import template from './category-selector.html';

// @ngInject
function AppStoreCategorySelectorController(
  $q, ENV, $state, $rootScope, currentStateService, projectsService
) {
  var vm = this;
  vm.selectOffering = selectOffering;
  vm.requestService = requestService;
  activate();

  function activate() {
    vm.selectProject = vm.resolve.selectProject;
    angular.forEach(ENV.offerings, function(offering) {
      if (ENV.futureCategories.indexOf(offering.key) !== -1) {
        offering.comingSoon = true;
      }
    });

    vm.groups = ENV.offeringCategories.map(category => ({
      label: category.label,
      items: ENV.offerings.filter(offering => offering.category === category.key)
    }));

    if (vm.selectProject) {
      currentStateService.getCustomer().then(function(customer) {
        vm.projects = customer.projects;
      });
    }
  }

  function selectOffering(offering) {
    if (vm.DialogForm.$invalid) {
      return $q.reject();
    } else {
      vm.submitting = true;
      return selectProject().then(function() {
        return $state.go(offering.state, {category: offering.key});
      }).then(function() {
        vm.close();
      }).finally(function() {
        vm.submitting = false;
      });
    }
  }

  function selectProject() {
    if (vm.selectedProject) {
      return projectsService.$get(vm.selectedProject).then(function(project) {
        $rootScope.$broadcast('adjustCurrentProject', project);
      });
    } else {
      return $q.when(true);
    }
  }

  function requestService() {
    $state.go('support.create').then(function() {
      vm.close();
    });
  }
}

export default function() {
  return {
    restrict: 'E',
    template: template,
    controller: AppStoreCategorySelectorController,
    controllerAs: 'DialogCtrl',
    scope: {},
    bindToController: {
      dismiss: '&',
      close: '&',
      resolve: '='
    }
  }
}
