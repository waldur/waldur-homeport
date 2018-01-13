export default class ExpertManagerIntro {
  /**
   * @name ExpertManagerIntro
   * @description a service responsible for expert manager introduction.
   * @param $rootScope
   * @param $state
   * @param currentStateService used to get current customer.
   * @param customersService used to check if user is owner or staff.
   * @param NavigationUtilsService used to invoke select workspace dialog.
   * @param WorkspaceService a service used to get current workspace.
   * @param ncIntroUtils a service used to communicate with angular-intro.js.
   * @param features used to check whether 'intro' feature is enabled.
   */
  // @ngInject
  constructor(
    $rootScope,
    $state,
    currentStateService,
    customersService,
    NavigationUtilsService,
    WorkspaceService,
    ncIntroUtils,
    features) {
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.currentStateService = currentStateService;
    this.customersService = customersService;
    this.NavigationUtilsService = NavigationUtilsService;
    this.WorkspaceService = WorkspaceService;
    this.ncIntroUtils = ncIntroUtils;
    this.features = features;

    this.workspace = {};
    this.hasPermissions = false;
  }

  setup() {
   /**
    * @description
    * # setup
    * @flow
    * Users lands on `organization.dashboard` or 'project.dashboard' state.
    *   1. Highlight Team item in menu. Select it if users clicks on a hint.
    *   2. Explain Users and Invitations tabs. Redirect to Invitations tab if user clicks on a hint.
    *   3. Highlight send invitation button. Redirect to Expert requests if users clicks on a hint.
    *   4. Display intro on expert requests list.
    *
    * If user stops at any of these steps the state has to be saved
    *   and it should be possible to invoke intro for the current step by hitting intro-button.
    */
    this.$rootScope.$on('WORKSPACE_CHANGED', this.refreshWorkspace.bind(this));
    this.$rootScope.$on('organizationDashboard.initialized', this.dashboardIntro.bind(this));
    this.$rootScope.$on('projectDashboard.initialized', this.dashboardIntro.bind(this));
    this.$rootScope.$on('customerTeam.initialized', this.customerTeamIntro.bind(this));
    this.$rootScope.$on('customerTeam.userTabSelected', this.customerTeamIntro.bind(this));
    this.$rootScope.$on('invitationList.initialized', this.invitationListIntro.bind(this));
    this.$rootScope.$on('expertRequestCustomerList.initialized', this.expertRequestCustomerListIntro.bind(this));
  }

  refreshWorkspace() {
    let newWorkspace = this.WorkspaceService.getWorkspace();
    if (!angular.equals(this.workspace, newWorkspace)) {
      this.workspace = newWorkspace;
      this.customersService.isOwnerOrStaff().then(isOwnerOrStaff => {
        let introVisible = this.features.isVisible('intro');
        let isExpertProvider = this.isExpertProvider();
        let newHasPermission = (isOwnerOrStaff && introVisible && isExpertProvider);
        if (this.hasPermissions !== newHasPermission) {
          this.hasPermissions = newHasPermission;
        }
      });
    }
  }

  isExpertProvider() {
    return this.workspace.hasOwnProperty('customer') && this.workspace.customer.is_expert_provider;
  }

  dashboardIntro() {
    if (!this.hasPermissions) {
      return;
    }

    const options = {
      steps: [
        {
          element: '#team',
          intro: gettext('Go to a Team view to manage team members'),
          scrollToElement: true,
          position: 'top',
        }
      ],
      showStepNumbers: false,
      doneLabel: gettext('Let\'s go'),
    };
    this.ncIntroUtils.intro('organization-dashboard-intro', options);
    this.ncIntroUtils.onComplete(() => {
      if (this.workspace.workspace === 'project') {
        return this.goToProjectState('project.team');
      } else {
        return this.goToOrganizationState('organization.team');
      }
    });
  }

  customerTeamIntro() {
    if (!this.hasPermissions) {
      return;
    }

    const options = {
      steps: [
        {
          element: '#users-tab',
          intro: gettext('List and edit team members.'),
        },
        {
          element: '#invitations-tab',
          intro: gettext('Invite new users.'),
        }
      ],
      doneLabel: gettext('Show me invitations'),
    };
    this.ncIntroUtils.intro('customer-team-intro', options);
    this.ncIntroUtils.onComplete(() => {
      this.$rootScope.$broadcast('customerTeam.selectInvitationTab');
    });
  }

  invitationListIntro() {
    if (!this.hasPermissions) {
      return;
    }

    const options = {
      steps: [{
        element: '.btn-0',
        intro: gettext('Sending invitation has never been simpler'),
      }],
      showStepNumbers: false,
      doneLabel: gettext('OK. Let\'s check expert requests'),
    };
    this.ncIntroUtils.intro('invitations-list-intro', options);
    this.ncIntroUtils.onComplete(() => {
      if (this.workspace.workspace === 'project') {
        return this.goToProjectState('project.experts');
      } else {
        return this.goToOrganizationState('organization.experts');
      }
    });
  }

  expertRequestCustomerListIntro() {
    if (!this.hasPermissions) {
      return;
    }

    const options = {
      steps: [
        {
          intro: gettext('Click on a \'Create proposal\' button when you are ready to fulfill expert request'),
        },
      ],
      showStepNumbers: false,
      doneLabel: gettext('Thanks')
    };
    this.ncIntroUtils.intro('expert-request-list-intro', options);
  }

  goToOrganizationState(name) {
    return this.currentStateService.getCustomer().then(customer => {
      this.$state.go(name, {uuid: customer.uuid});
    });
  }

  goToProjectState(name) {
    return this.currentStateService.getProject().then(project => {
      this.$state.go(name, {uuid: project.uuid});
    });
  }
}
