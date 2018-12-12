export default class BaseIntro {
  // @ngInject
  constructor($rootScope,
              $q,
              ncIntroUtils,
              WorkspaceService,
              NavigationUtilsService,
              usersService,
              ENV,
              customersService,
              features) {
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.ncIntroUtils = ncIntroUtils;
    this.WorkspaceService = WorkspaceService;
    this.NavigationUtilsService = NavigationUtilsService;
    this.features = features;
    this.workspace = {};
    this.hasPermissions = false;
    this.usersService = usersService;
    this.ENV = ENV;
    this.customersService = customersService;
  }

  setup() {
   /**
    * @description
    * # setup
    * @flow
    * Users lands on `profile.details` state.
    *   1. Display a hint on how to select organization.
    *   2. Open select workspace dialog
    *   If user declines dialog:
    *     return to step 1
    *   User selects workspace
    *
    * If user stops at any of these steps the state has to be saved
    *   and it should be possible to invoke intro for the current step by hitting intro-button.
    */
    this.$rootScope.$on('WORKSPACE_CHANGED', this.refreshWorkspace.bind(this));
    this.$rootScope.$on('selectWorkspaceToggle.initialized', this.workspaceToggleIntro.bind(this));
    this.$rootScope.$on('selectWorkspaceDialog.initialized', this.selectWorkspaceDialogIntro.bind(this));
    this.$rootScope.$on('selectWorkspaceDialog.dismissed', this.selectWorkspaceDialogDismissed.bind(this));
  }

  refreshWorkspace() {
    this.cleanUp();
    let newWorkspace = this.WorkspaceService.getWorkspace();
    if (!angular.equals(this.workspace, newWorkspace)) {
      this.workspace = newWorkspace;
      let newHasPermission = (this.workspace.hasCustomer && this.features.isVisible('intro'));
      if (newHasPermission !== this.hasPermissions) {
        this.hasPermissions = newHasPermission;
      }
    }
  }

  cleanUp() {
    this.previous_state = {};
  }

  workspaceToggleIntro() {
    if (!this.hasPermissions) {
      return;
    }

    const options = {
      steps: [
        {
          element: '#select-workspace-title',
          intro: gettext('To start please select a workspace'),
          doneLabel: gettext('Ok, what\'s next?')
        }
      ]
    };
    this.ncIntroUtils.intro('select-workspace-intro', options);
    this.ncIntroUtils.onComplete(() => {
      this.NavigationUtilsService.selectWorkspace();
    });
  }

  selectWorkspaceDialogIntro() {
    if (!this.hasPermissions) {
      return;
    }
    this.rememberState();

    let userCanCreateOrganization = false;
    let canSelectOrganization = false;
    this.$q.all([
      this.userCanCreateOrganization().then(canCreateOrganization => {
        userCanCreateOrganization = canCreateOrganization;
      }),
      this.customersAvailable().then(customersAvailable => {
        canSelectOrganization = customersAvailable;
      })
    ]).then(() => {
      let options = {
        steps: []
      };

      if (userCanCreateOrganization) {
        options.steps.push({
          element: '#add-new-organization',
          intro: gettext('Add a new organization')
        });
      }

      if (canSelectOrganization) {
        options.steps.push({
          element: '#organization-selector',
          intro: gettext('Select one to go to a customer workspace'),
          position: 'top',
        });
      }

      if (!options.steps.length) {
        this.ncIntroUtils.cleanUp();
      } else {
        this.ncIntroUtils.intro('select-workspace-dialog-intro', options);
      }
    });
  }

  customersAvailable() {
    return this.customersService.countCustomers().then(count => {
      return count > 0;
    });
  }

  userCanCreateOrganization() {
    return this.usersService.getCurrentUser().then((user) => {
      return user.is_staff || this.ENV.plugins.WALDUR_CORE.OWNER_CAN_MANAGE_CUSTOMER;
    });
  }

  selectWorkspaceDialogDismissed() {
    if (!this.hasPermissions) {
      return;
    }

    let workspace = this.WorkspaceService.getWorkspace();
    if (!workspace.customer && workspace.hasCustomer) {
      this.workspaceToggleIntro(this.$rootScope);
    } else if (this.previous_state.name && this.previous_state.name !== 'select-workspace-intro') {
      this.ncIntroUtils.intro(this.previous_state.name, this.previous_state.options);
      this.ncIntroUtils.onComplete(this.previous_state.onComplete);
    }
  }

  rememberState() {
    this.previous_state = this.ncIntroUtils.getState();
  }
}
