import template from './appstore-selector-dialog.html';

const appstoreSelectorDialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class AppstoreSelectorDialogController {
    // @ngInject
    constructor(
      $q,
      $state,
      $scope,
      ENV,
      currentStateService,
      usersService,
      projectPermissionsService,
      AppstoreCategoriesService,
      ResourceProvisionPolicy) {
      this.$q = $q;
      this.$state = $state;
      this.$scope = $scope;
      this.ENV = ENV;
      this.currentStateService = currentStateService;
      this.usersService = usersService;
      this.projectPermissionsService = projectPermissionsService;
      this.ResourceProvisionPolicy = ResourceProvisionPolicy;
      this.AppstoreCategoriesService = AppstoreCategoriesService;
    }

    $onInit() {
      this.loading = true;
      this.$q.all([
        this.loadCustomer(),
        this.loadProject(),
        this.loadCategories(),
      ]).finally(() => this.loading = false);
    }

    loadCustomer() {
      return this.currentStateService.getCustomer().then(customer => this.currentCustomer = customer);
    }

    loadProject() {
      this.$scope.$watch(() => this.selectedProject, () => this.checkPolicy());
      this.selectProject = this.resolve.options.selectProject;

      return this.usersService.getCurrentUser()
        .then(user => this.currentUser = user)
        .then(() => {
          if (this.selectProject) {
            return this.currentStateService.getCustomer().then(customer => {
              this.projects = customer.projects;
            });
          } else {
            return this.currentStateService.getProject().then(project => {
              return this.projectPermissionsService.getList({
                user: this.currentUser.uuid,
                project: project.uuid,
              }).then(permissions => {
                project.permissions = permissions;
                this.selectedProject = project;
              });
            });
          }
        });
    }

    checkPolicy() {
      if (!this.selectedProject || !this.currentCustomer || !this.currentUser) {
        return;
      }

      angular.forEach(this.groups, group => {
        angular.forEach(group.items, category => {
          if (!this.isResource(category.key)) {
            return;
          }
          const {disabled, errorMessage} = this.ResourceProvisionPolicy.checkResource(
            this.currentUser, this.currentCustomer, this.selectedProject, category.key
          );
          category.disabled = disabled;
          category.errorMessage = errorMessage;
        });
      });
    }

    isResource(key) {
      return angular.isDefined(this.ENV.resourcesTypes[key]);
    }

    loadCategories() {
      return this.AppstoreCategoriesService.getGroups().then(groups => {
        this.groups = groups;
        this.initCurrentGroup();
        this.checkPolicy();
      });
    }

    initCurrentGroup() {
      this.currentGroup = 0;
      if (this.resolve.options.currentCategory) {
        const matches = this.groups.filter(group => group.label === this.resolve.options.currentCategory);
        if (matches.length === 1) {
          this.currentGroup = this.groups.indexOf(matches[0]);
        }
      }
    }

    selectCategory(category) {
      if (!this.selectedProject) {
        return;
      }
      if (this.DialogForm.$valid) {
        this.submitting = true;
        return this.$state.go(category.state, {
          category: category.key,
          uuid: this.selectedProject.uuid
        })
        .then(() => this.close())
        .finally(() => this.submitting = false);
      }
    }

    createProject() {
      this.close();
      return this.$state.go('organization.createProject', {
        uuid: this.currentCustomer.uuid,
      });
    }
  }
};

export default appstoreSelectorDialog;
