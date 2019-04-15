const invitationsList = {
  controller: InvitationsListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default invitationsList;

// @ngInject
function InvitationsListController(
  baseControllerListClass,
  customersService,
  currentStateService,
  usersService,
  invitationService,
  ncUtils,
  $scope,
  $state,
  $filter,
  $q,
  InvitationCreateAction,
  InvitationSendAction,
  InvitationCancelAction,
  ENV
) {
  let controllerScope = this;
  let InvitationController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = invitationService;
      let fn = this._super.bind(this);
      this.loading = true;
      this.loadContext().then(() => {
        this.actionContext = this.getActionContext();
        this.tableOptions = this.getTableOptions();
        fn();
      }).finally(() => {
        $scope.$emit('invitationList.initialized');
        this.loading = false;
      });
    },
    loadContext: function() {
      return $q.all([
        currentStateService.getCustomer().then(customer => {
          this.currentCustomer = customer;
        }),
        usersService.getCurrentUser().then(user => {
          this.currentUser = user;
        })
      ]);
    },
    getActionContext: function() {
      return {
        resetCache: controllerScope.resetCache.bind(this),
        customer: this.currentCustomer,
        user: this.currentUser,
      };
    },
    getFilter: function() {
      return {
        customer: this.currentCustomer.uuid
      };
    },
    getUserFilter: function() {
      return {
        name: 'state',
        choices: [
          {
            title: gettext('Requested'),
            value: 'requested',
          },
          {
            title: gettext('Rejected'),
            value: 'rejected',
          },
          {
            title: gettext('Pending'),
            value: 'pending',
            chosen: true,
          },
          {
            title: gettext('Canceled'),
            value: 'canceled'
          },
          {
            title: gettext('Expired'),
            value: 'expired'
          },
          {
            title: gettext('Accepted'),
            value: 'accepted'
          }
        ]
      };
    },
    getTableOptions: function() {
      return {
        noDataText: gettext('You have no team invitations yet.'),
        noMatchesText: gettext('No invitations found matching filter.'),
        enableOrdering: true,
        columns: [
          {
            title: gettext('Email'),
            className: 'all',
            orderField: 'email',
            render: function(row) {
              let avatar = '<img gravatar-src="\'{gravatarSrc}\'" gravatar-size="100" alt="" class="avatar-img img-xs">'
                .replace('{gravatarSrc}', row.email);
              return avatar + ' ' + row.email;
            }
          },
          {
            title: gettext('Role'),
            className: 'min-tablet-l',
            orderable: false,
            render: function(row) {
              if (row.customer_role) {
                return ENV.roles.owner;
              } else if (row.project_role) {
                let href = $state.href('project.details', {
                  uuid: ncUtils.getUUID(row.project)
                });
                let roleTitle = ENV.roles[row.project_role] || 'Unknown';
                let title = roleTitle + ' in ' + row.project_name;
                return ncUtils.renderLink(href, title);
              }
            }
          },
          {
            title: gettext('Status'),
            className: 'min-tablet-l',
            orderField: 'state',
            render: function(row) {
              return row.state;
            }
          },
          {
            title: gettext('Created at'),
            className: 'min-tablet-l',
            orderField: 'created',
            render: function(row) {
              return $filter('shortDate')(row.created);
            }
          },
          {
            title: gettext('Expires at'),
            className: 'min-tablet-l',
            orderable: false,
            render: function(row) {
              return $filter('shortDate')(row.expires);
            }
          },
          {
            title: gettext('URL'),
            className: 'none',
            orderable: false,
            render: function(row) {
              return row.link_template.replace('{uuid}', row.uuid);
            }
          }
        ],
        tableActions: [
          InvitationCreateAction(this.actionContext),
        ],
        rowActions: [
          InvitationSendAction(this.actionContext),
          InvitationCancelAction(this.actionContext),
        ]
      };
    },
  });
  controllerScope.__proto__ = new InvitationController();
}
