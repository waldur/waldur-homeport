// @ngInject
export class CustomerUtilsService {
  constructor(
    customersService,
    projectsService,
    projectPermissionsService,
    currentStateService,
    usersService,
    $rootScope,
    $state) {
    this.customersService = customersService;
    this.projectsService = projectsService;
    this.projectPermissionsService = projectPermissionsService;
    this.currentStateService = currentStateService;
    this.usersService = usersService;
    this.$rootScope = $rootScope;
    this.$state = $state;
  }

  isStaffOwnerManager() {
    return this.customersService.isOwnerOrStaff().then(response => {
      return response || this.projectPermissionsService.getList({
        customer: this.currentStateService.getCustomerUuid(),
        user: this.usersService.currentUser.uuid,
        role: 'manager'
      }).then(response => {
        return response.length > 0;
      });
    });
  }

  checkWorkspace() {
    return this.isStaffOwnerManager().then(response => {
      this.currentStateService.setStaffOwnerManager(response);
      if (!response) {
        this.$state.go('profile.details');
      }
    });
  }

  getCurrentCustomer() {
    const uuid = this.$state.$current.uuid;
    if (!uuid) {
      return this.currentStateService.getCustomer();
    }
    return this.customersService.$get(uuid).then(customer => {
      this.$rootScope.$broadcast('adjustCurrentCustomer', customer);
      return customer;
    }).catch(error => {
      if (error.status === 404) {
        this.$state.go('errorPage.notFound');
      }
    });
  }

  getCurrentProject(uuid) {
    if (!uuid) {
      return this.projectsService.getProject(this.currentStateService.getProjectUuid());
    }
    return this.projectsService.$get(uuid).then(project => {
      this.$rootScope.$broadcast('adjustCurrentProject', project);
      return project;
    }).catch(error => {
      if (error.status === 404) {
        this.$state.go('errorPage.notFound');
      }
    });
  }

  getStoredCustomer() {
    const uuid = this.currentStateService.getCustomerUuid();
    return this.customersService.$get(uuid).then(customer => {
      return this.isStaffOwnerManager().then(response => {
        this.currentStateService.setStaffOwnerManager(response);
        this.$rootScope.$broadcast('adjustCurrentCustomer', customer);
        return customer;
      });
    }).catch(error => {
      if (error.status === 404) {
        this.$state.go('errorPage.notFound');
      }
    });
  }
}
