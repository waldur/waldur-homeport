import template from './invitation-dialog.html';

export default function() {
  return {
    restrict: 'E',
    template: template,
    controller: InvitationDialogController,
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
function InvitationDialogController($q, $state, invitationService, ncUtilsFlash, ENV) {
  var vm = this;
  vm.submitForm = submitForm;
  activate();

  function activate() {
    vm.customer = vm.resolve.customer;
    vm.roles = [
      {
        field: 'customer_role',
        title: ENV.roles.owner,
        value: 'owner',
        icon: 'fa-sitemap'
      },
      {
        field: 'project_role',
        title: ENV.roles.manager,
        value: 'manager',
        icon: 'fa-users'
      },
      {
        field: 'project_role',
        title: ENV.roles.admin,
        value: 'admin',
        icon: 'fa-server'
      }
    ];
    vm.role = vm.roles[0];
  }

  function submitForm() {
    if (vm.DialogForm.$invalid) {
      return $q.reject();
    }

    vm.submitting = true;
    return createInvite().then(function() {
      vm.close();
      ncUtilsFlash.success('Invitation has been created.');
    }).catch(function(response) {
      vm.errors = response.data;
      ncUtilsFlash.error('Unable to create invitation.');
    }).finally(function() {
      vm.submitting = false;
    });
  }

  function createInvite() {
    var invite = invitationService.$create();
    invite.link_template = getTemplateUrl();
    invite.email = vm.email;
    invite.civil_number = vm.civil_number;
    if (vm.role.field === 'customer_role') {
      invite.customer_role = vm.role.value;
      invite.customer = vm.customer.url;
    } else if (vm.role.field === 'project_role') {
      invite.project_role = vm.role.value;
      invite.project = vm.project.url;
    }
    return invite.$save();
  }

  function getTemplateUrl() {
    var path = $state.href('invitation', {uuid: 'TEMPLATE'});
    return location.origin + '/' + path.replace('TEMPLATE', '{uuid}');
  }
}
