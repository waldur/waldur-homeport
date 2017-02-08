import template from './category-selector.html';
import './category-selector.scss';

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
  };
}

// @ngInject
function AppStoreCategorySelectorController(
  $q, ENV, $state, $rootScope, currentStateService, projectsService, $uibModal, ISSUE_IDS
) {
  var vm = this;
  vm.selectOffering = selectOffering;
  vm.requestService = requestService;
  activate();

  function activate() {
    vm.selectProject = vm.resolve.selectProject;

    var offerings = ENV.offerings.filter(item =>
      !item.requireOwnerOrStaff || currentStateService.getOwnerOrStaff());

    angular.forEach(offerings, function(offering) {
      if (ENV.futureCategories.indexOf(offering.key) !== -1) {
        offering.comingSoon = true;
      }
    });

    offerings = offerings.reduce((map, item) => {
      map[item.key] = item;
      return map;
    }, {});

    vm.groups = ENV.offeringCategories.map(category => ({
      label: category.label,
      items: category.items.map(item => offerings[item]).filter(x => !!x)
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
      return selectProject().then(project => {
        return $state.go(offering.state, {category: offering.key, uuid: project.uuid});
      }).then(function() {
        vm.close();
      }).finally(function() {
        vm.submitting = false;
      });
    }
  }

  function selectProject() {
    if (vm.selectedProject) {
      return $q.when(vm.selectedProject);
    } else {
      return currentStateService.getProject();
    }
  }

  function requestService() {
    vm.close();
    return $uibModal.open({
      component: 'issueCreateDialog',
      resolve: {
        issue: currentStateService.getCustomer().then(customer => ({
          customer,
          type: ISSUE_IDS.SERVICE_REQUEST
        })),
        options: {
          title: 'Request a new service',
          descriptionPlaceholder: 'Please clarify why do you need it',
          descriptionLabel: 'Motivation',
          summaryLabel: 'Service name'
        }
      }
    });
  }
}
