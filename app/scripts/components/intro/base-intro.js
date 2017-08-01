export default class BaseIntro {
  // @ngInit
  constructor($rootScope, ncIntroUtils, WorkspaceService, NavigationUtilsService, features) {
    this.$rootScope = $rootScope;
    this.ncIntroUtils = ncIntroUtils;
    this.WorkspaceService = WorkspaceService;
    this.NavigationUtilsService = NavigationUtilsService;
    this.features = features;

    this.workspace = {};
    this.hasPermissions = false;
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
    if (this.workspace.customer || !this.workspace.hasCustomer) {
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
    this.rememberState();
    const options = {
      steps: [
        {
          element: '#add-new-organization',
          intro: gettext('Add a new organization')
        },
        {
          element: '#organization-selector',
          intro: gettext('Or select one to go to a customer workspace'),
          position: 'top',
        }
      ],
      doneLabel: gettext('Let me select my workspace'),
    };
    this.ncIntroUtils.intro('select-workspace-dialog-intro', options);
  }


  selectWorkspaceDialogDismissed() {
    let workspace = this.WorkspaceService.getWorkspace();
    if (!workspace.customer && workspace.hasCustomer) {
      this.workspaceToggleIntro(this.$rootScope);
    } else if(this.previous_state.name && this.previous_state.name !== 'select-workspace-intro') {
      this.ncIntroUtils.intro(this.previous_state.name, this.previous_state.options);
      this.ncIntroUtils.onComplete(this.previous_state.onComplete);
    }
  }

  rememberState() {
    this.previous_state = this.ncIntroUtils.getState();
  }
}
